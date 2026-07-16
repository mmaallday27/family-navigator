// The family store — the single source of truth for who this family is and
// everything they've done. "Continuity is the product": all interactive state
// (profile, checklists, goals, documents, saved resources) lives here and now
// persists to the SERVER, per account — so the record follows the family across
// devices, not just one browser.
//
// Persistence is honest: saves are tracked (saving/saved/failed), failures
// retry automatically and are surfaced to the UI, writes carry an
// optimistic-concurrency token so two devices never silently overwrite each
// other, and a pagehide flush catches changes made just before the tab closes.

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
  type Dispatch,
  type ReactNode,
} from 'react'
import type { DocFile } from '../data/documents'
import type { CompanionResponse } from '../data/companion'
import { allChecklistItems } from '../data/transition'
import { apiGetFamily, apiPutFamily, apiResetFamily, ConflictError } from '../api'
import { useAuth } from './AuthContext'

export interface ChildProfile {
  name: string
  /** ISO date (yyyy-mm-dd). Age and legal milestones are derived from this. */
  birthDate: string
  diagnosis: string
  diagnosedAt: string
  strengths: string[]
  interests: string[]
  communication: string
  schoolGrade: string
}

export interface ParentProfile {
  name: string
  relationship: string
}

/**
 * Where the family lives — drives state-aware navigation (resources, agency
 * routing, state milestones). Never inferred: the family tells us, and every
 * field may be '' if they'd rather not say.
 */
export interface FamilyLocation {
  state: string // two-letter code, e.g. 'NY', or ''
  county: string
  zip: string
}

export interface Goal {
  id: string
  title: string
  area: string
  due: string
  progress: number
  owner: string
}

export interface StoredMessage {
  id: number
  role: 'user' | 'assistant'
  text?: string
  answer?: CompanionResponse
}

export interface ActivityEvent {
  id: string
  when: string // ISO timestamp
  text: string
}

/**
 * The AI's persistent memory of this family. The companion never starts from
 * zero: conversations, topics already covered, and visit history all persist.
 */
export interface AiMemory {
  lastVisit: string | null
  previousVisit: string | null
  /** Topic keys the family has already discussed with the companion. */
  topicsDiscussed: string[]
  /** The companion conversation, resumed across sessions (capped). */
  messages: StoredMessage[]
  /** Insight ids the family has dismissed — don't resurface them. */
  dismissedInsights: string[]
}

export interface FamilyState {
  version: number
  onboarded: boolean
  /** True when exploring with the sample (Carter) family. */
  isDemo: boolean
  child: ChildProfile
  parent: ParentProfile
  location: FamilyLocation
  /** ISO timestamp of the onboarding data-use acknowledgement (null = not yet). */
  consentAcknowledgedAt: string | null
  /** Concern ids chosen during onboarding — used to seed goals & guidance. */
  concerns: string[]
  /** Transition checklist completion, keyed by checklist item id. */
  checks: Record<string, boolean>
  savedResources: string[]
  documents: DocFile[]
  goals: Goal[]
  /** Everything the family does, in order — the raw material of continuity. */
  activity: ActivityEvent[]
  aiMemory: AiMemory
}

export type FamilyAction =
  | {
      type: 'complete-onboarding'
      child: ChildProfile
      parent: ParentProfile
      concerns: string[]
      isDemo: boolean
      goals: Goal[]
      checks: Record<string, boolean>
      documents: DocFile[]
      savedResources: string[]
      location?: FamilyLocation
      consentAcknowledgedAt?: string | null
    }
  | { type: 'update-child'; child: Partial<ChildProfile> }
  | { type: 'set-location'; location: FamilyLocation }
  | { type: 'acknowledge-consent'; at: string }
  | { type: 'set-document-insights'; id: string; insights: import('../data/documents').DocumentInsights }
  | { type: 'toggle-check'; id: string }
  | { type: 'toggle-saved'; id: string }
  | { type: 'add-document'; name: string; categoryId: string; id?: string; size?: string; hasFile?: boolean }
  | { type: 'remove-document'; id: string }
  | { type: 'add-goal'; goal: Goal }
  | { type: 'set-goal-progress'; id: string; progress: number }
  | { type: 'remove-goal'; id: string }
  | { type: 'visit'; at: string }
  | { type: 'companion-topic'; topic: string }
  | { type: 'set-companion-messages'; messages: StoredMessage[] }
  | { type: 'dismiss-insight'; id: string }
  | { type: 'hydrate'; state: FamilyState }
  | { type: 'reset' }

const VERSION = 4

const emptyLocation: FamilyLocation = { state: '', county: '', zip: '' }

const emptyAiMemory: AiMemory = {
  lastVisit: null,
  previousVisit: null,
  topicsDiscussed: [],
  messages: [],
  dismissedInsights: [],
}

function addActivity(state: FamilyState, text: string): ActivityEvent[] {
  const event: ActivityEvent = {
    id: typeof crypto !== 'undefined' && crypto.randomUUID ? `ev-${crypto.randomUUID()}` : `ev${Date.now()}-${state.activity.length}`,
    when: new Date().toISOString(),
    text,
  }
  return [event, ...state.activity].slice(0, 50)
}

const emptyChild: ChildProfile = {
  name: '',
  birthDate: '',
  diagnosis: '',
  diagnosedAt: '',
  strengths: [],
  interests: [],
  communication: '',
  schoolGrade: '',
}

const initialState: FamilyState = {
  version: VERSION,
  onboarded: false,
  isDemo: false,
  child: emptyChild,
  parent: { name: '', relationship: '' },
  location: emptyLocation,
  consentAcknowledgedAt: null,
  concerns: [],
  checks: {},
  savedResources: [],
  documents: [],
  goals: [],
  activity: [],
  aiMemory: emptyAiMemory,
}

function reducer(state: FamilyState, action: FamilyAction): FamilyState {
  switch (action.type) {
    case 'complete-onboarding':
      return {
        ...initialState,
        onboarded: true,
        isDemo: action.isDemo,
        child: action.child,
        parent: action.parent,
        location: action.location ?? emptyLocation,
        consentAcknowledgedAt: action.consentAcknowledgedAt ?? null,
        concerns: action.concerns,
        goals: action.goals,
        checks: action.checks,
        documents: action.documents,
        savedResources: action.savedResources,
        activity: [
          {
            id: 'ev0',
            when: new Date().toISOString(),
            text: `${action.child.name.split(' ')[0]}’s family record was created`,
          },
        ],
        aiMemory: { ...emptyAiMemory, lastVisit: new Date().toISOString() },
      }
    case 'update-child': {
      const child = { ...state.child, ...action.child }
      return {
        ...state,
        child,
        activity: addActivity(state, `${child.name.split(' ')[0]}’s profile was updated`),
      }
    }
    case 'set-location':
      return { ...state, location: action.location }
    case 'acknowledge-consent':
      return { ...state, consentAcknowledgedAt: action.at }
    case 'set-document-insights':
      return {
        ...state,
        documents: state.documents.map((d) => (d.id === action.id ? { ...d, insights: action.insights } : d)),
      }
    case 'toggle-check': {
      const nowChecked = !state.checks[action.id]
      const item = allChecklistItems.find((i) => i.id === action.id)
      return {
        ...state,
        checks: { ...state.checks, [action.id]: nowChecked },
        activity:
          nowChecked && item
            ? addActivity(state, `Completed “${item.label.split('{name}').join(state.child.name.split(' ')[0])}”`)
            : state.activity,
      }
    }
    case 'toggle-saved': {
      const saved = state.savedResources.includes(action.id)
        ? state.savedResources.filter((id) => id !== action.id)
        : [...state.savedResources, action.id]
      return { ...state, savedResources: saved }
    }
    case 'add-document': {
      const doc: DocFile = {
        id: action.id ?? (typeof crypto !== 'undefined' && crypto.randomUUID ? `u-${crypto.randomUUID()}` : `u${Date.now()}`),
        name: action.name,
        categoryId: action.categoryId,
        date: new Date().toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        }),
        size: action.size ?? '—',
        hasFile: action.hasFile,
      }
      return {
        ...state,
        documents: [doc, ...state.documents],
        activity: addActivity(state, `Added “${action.name}” to the Document Vault`),
      }
    }
    case 'remove-document':
      return {
        ...state,
        documents: state.documents.filter((d) => d.id !== action.id),
      }
    case 'add-goal':
      return {
        ...state,
        goals: [...state.goals, action.goal],
        activity: addActivity(state, `Added the goal “${action.goal.title}”`),
      }
    case 'set-goal-progress': {
      const goal = state.goals.find((g) => g.id === action.id)
      return {
        ...state,
        goals: state.goals.map((g) => (g.id === action.id ? { ...g, progress: action.progress } : g)),
        activity:
          goal && action.progress >= 100
            ? addActivity(state, `Completed the goal “${goal.title}”`)
            : state.activity,
      }
    }
    case 'remove-goal':
      return { ...state, goals: state.goals.filter((g) => g.id !== action.id) }
    case 'visit':
      return {
        ...state,
        aiMemory: {
          ...state.aiMemory,
          previousVisit: state.aiMemory.lastVisit,
          lastVisit: action.at,
        },
      }
    case 'companion-topic':
      if (state.aiMemory.topicsDiscussed.includes(action.topic)) return state
      return {
        ...state,
        aiMemory: {
          ...state.aiMemory,
          topicsDiscussed: [...state.aiMemory.topicsDiscussed, action.topic],
        },
      }
    case 'set-companion-messages':
      return {
        ...state,
        aiMemory: { ...state.aiMemory, messages: action.messages.slice(-30) },
      }
    case 'dismiss-insight':
      if (state.aiMemory.dismissedInsights.includes(action.id)) return state
      return {
        ...state,
        aiMemory: {
          ...state.aiMemory,
          dismissedInsights: [...state.aiMemory.dismissedInsights, action.id],
        },
      }
    case 'hydrate':
      return action.state
    case 'reset':
      return initialState
    default:
      return state
  }
}

/** Normalize a server-loaded record into a complete FamilyState. */
function fromServer(record: Partial<FamilyState>): FamilyState {
  return {
    ...initialState,
    ...record,
    version: VERSION,
    child: { ...emptyChild, ...(record.child ?? {}) },
    parent: { name: '', relationship: '', ...(record.parent ?? {}) },
    location: { ...emptyLocation, ...(record.location ?? {}) },
    consentAcknowledgedAt: record.consentAcknowledgedAt ?? null,
    concerns: record.concerns ?? [],
    checks: record.checks ?? {},
    savedResources: record.savedResources ?? [],
    documents: record.documents ?? [],
    goals: record.goals ?? [],
    activity: record.activity ?? [],
    aiMemory: { ...emptyAiMemory, ...(record.aiMemory ?? {}) },
  }
}

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error' | 'conflict'

interface FamilyContextValue {
  state: FamilyState
  dispatch: Dispatch<FamilyAction>
  /** True while the record is being loaded from the server after sign-in. */
  loading: boolean
  /** Persistence health — surfaced so the UI can be honest about saving. */
  saveStatus: SaveStatus
  /** Push any unsaved changes now (call before signing out). */
  flush: () => Promise<boolean>
  /** Start over: clears the record AND stored documents on the server. */
  resetRecord: () => Promise<void>
}

const FamilyContext = createContext<FamilyContextValue | null>(null)

export function FamilyProvider({ children }: { children: ReactNode }) {
  const { user, loading: authLoading } = useAuth()
  const [state, dispatch] = useReducer(reducer, initialState)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [loadAttempt, setLoadAttempt] = useState(0)
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle')
  const loadedRef = useRef(false)
  const visitedRef = useRef(false)
  const onboardedRef = useRef(false)
  const updatedAtRef = useRef<string | null>(null)
  const stateRef = useRef(state)
  const dirtyRef = useRef(false)
  const savingRef = useRef(false)
  const skipPersistRef = useRef(false)
  const retryRef = useRef<number | undefined>(undefined)
  stateRef.current = state

  /**
   * Save the latest state. Retries automatically on failure; on a
   * cross-device conflict, adopts the server's copy and reports it.
   */
  const saveNow = useCallback(async (): Promise<boolean> => {
    if (savingRef.current) return true
    if (!dirtyRef.current || !loadedRef.current) return true
    savingRef.current = true
    setSaveStatus('saving')
    try {
      while (dirtyRef.current) {
        dirtyRef.current = false
        const { updatedAt } = await apiPutFamily(stateRef.current, updatedAtRef.current)
        updatedAtRef.current = updatedAt
      }
      setSaveStatus('saved')
      return true
    } catch (err) {
      if (err instanceof ConflictError) {
        // Another device saved since we loaded. Adopt the server's copy —
        // never overwrite it — and let the UI say so.
        updatedAtRef.current = err.updatedAt
        dirtyRef.current = false
        if (err.record) {
          skipPersistRef.current = true
          dispatch({ type: 'hydrate', state: fromServer(err.record) })
        }
        setSaveStatus('conflict')
        return false
      }
      dirtyRef.current = true
      setSaveStatus('error')
      window.clearTimeout(retryRef.current)
      retryRef.current = window.setTimeout(() => {
        void saveNow()
      }, 5_000)
      return false
    } finally {
      savingRef.current = false
    }
  }, [])

  // Hydrate the record from the server once the signed-in account is known.
  useEffect(() => {
    if (authLoading) return
    let cancelled = false
    if (!user) {
      // Signed out: clear any in-memory record so nothing leaks to the next user.
      loadedRef.current = false
      visitedRef.current = false
      onboardedRef.current = false
      updatedAtRef.current = null
      dirtyRef.current = false
      setLoadError(null)
      dispatch({ type: 'reset' })
      setLoading(false)
      return
    }
    setLoading(true)
    setLoadError(null)
    apiGetFamily()
      .then(({ record, updatedAt }) => {
        if (cancelled) return
        updatedAtRef.current = updatedAt
        skipPersistRef.current = true
        dispatch(record ? { type: 'hydrate', state: fromServer(record) } : { type: 'reset' })
        // Track whether the loaded record is already onboarded, so we can
        // persist the first onboarding write immediately (see below).
        onboardedRef.current = !!record?.onboarded
        loadedRef.current = true
        setLoading(false)
      })
      .catch((err: Error) => {
        if (cancelled) return
        // A failed load is NOT an empty record — treating it as one would
        // send the family back through onboarding and overwrite real data.
        setLoadError(err.message || 'We couldn’t load your family record.')
        setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [user, authLoading, loadAttempt])

  // Record this visit once, after hydration — powers "since your last visit".
  useEffect(() => {
    if (loading || !loadedRef.current || visitedRef.current || !user) return
    visitedRef.current = true
    dispatch({ type: 'visit', at: new Date().toISOString() })
  }, [loading, user])

  // Persist to the server on change, only after a real load so the empty
  // initial state can never overwrite a hydrated record. Onboarding (the
  // false→true transition) is written IMMEDIATELY — a reload right after
  // sign-up must never lose the brand-new record. Other changes debounce.
  useEffect(() => {
    if (!user || loading || !loadedRef.current) return
    if (skipPersistRef.current) {
      skipPersistRef.current = false
      return
    }
    const justOnboarded = state.onboarded && !onboardedRef.current
    onboardedRef.current = state.onboarded
    dirtyRef.current = true
    if (justOnboarded) {
      void saveNow()
      return
    }
    const handle = window.setTimeout(() => {
      void saveNow()
    }, 400)
    return () => window.clearTimeout(handle)
  }, [state, user, loading, saveNow])

  // Last-chance flush when the tab is closing or backgrounded (best effort;
  // keepalive requests are size-limited, so this complements — not replaces —
  // the retry loop above).
  useEffect(() => {
    const flushOnHide = () => {
      if (!dirtyRef.current || !loadedRef.current || !user) return
      dirtyRef.current = false
      apiPutFamily(stateRef.current, updatedAtRef.current, true)
        .then(({ updatedAt }) => {
          updatedAtRef.current = updatedAt
        })
        .catch(() => {
          dirtyRef.current = true
        })
    }
    window.addEventListener('pagehide', flushOnHide)
    return () => window.removeEventListener('pagehide', flushOnHide)
  }, [user])

  const flush = useCallback(() => saveNow(), [saveNow])

  const resetRecord = useCallback(async () => {
    await apiResetFamily()
    window.clearTimeout(retryRef.current)
    dirtyRef.current = false
    updatedAtRef.current = null
    onboardedRef.current = false
    skipPersistRef.current = true
    setSaveStatus('idle')
    dispatch({ type: 'reset' })
  }, [])

  const value = useMemo(
    () => ({ state, dispatch, loading, saveStatus, flush, resetRecord }),
    [state, loading, saveStatus, flush, resetRecord],
  )

  // A load failure gets an honest retry screen — never a silent reset.
  if (user && !loading && loadError) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-canvas px-6 text-center">
        <p className="text-lg font-semibold text-ink">We couldn’t load your family record</p>
        <p className="max-w-md text-sm text-ink-soft">
          Nothing is lost — we just couldn’t reach the server. Check your connection and try again.
        </p>
        <button
          type="button"
          onClick={() => setLoadAttempt((n) => n + 1)}
          className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600"
        >
          Try again
        </button>
      </div>
    )
  }

  return <FamilyContext.Provider value={value}>{children}</FamilyContext.Provider>
}

export function useFamily(): FamilyContextValue {
  const ctx = useContext(FamilyContext)
  if (!ctx) throw new Error('useFamily must be used inside <FamilyProvider>')
  return ctx
}
