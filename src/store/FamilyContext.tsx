// The family store — the single source of truth for who this family is and
// everything they've done. "Continuity is the product": all interactive state
// (profile, checklists, goals, documents, saved resources) lives here and
// persists to localStorage, so the platform remembers and the family doesn't
// have to.

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  type Dispatch,
  type ReactNode,
} from 'react'
import type { DocFile } from '../data/documents'
import type { CompanionResponse } from '../data/companion'
import { allChecklistItems } from '../data/transition'

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
    }
  | { type: 'toggle-check'; id: string }
  | { type: 'toggle-saved'; id: string }
  | { type: 'add-document'; name: string; categoryId: string }
  | { type: 'visit'; at: string }
  | { type: 'companion-topic'; topic: string }
  | { type: 'set-companion-messages'; messages: StoredMessage[] }
  | { type: 'dismiss-insight'; id: string }
  | { type: 'reset' }

const STORAGE_KEY = 'family-navigator/state/v2'
const VERSION = 3

const emptyAiMemory: AiMemory = {
  lastVisit: null,
  previousVisit: null,
  topicsDiscussed: [],
  messages: [],
  dismissedInsights: [],
}

function addActivity(state: FamilyState, text: string): ActivityEvent[] {
  const event: ActivityEvent = {
    id: `ev${Date.now()}-${state.activity.length}`,
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
        id: `u${Date.now()}`,
        name: action.name,
        categoryId: action.categoryId,
        date: new Date().toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        }),
        size: '—',
      }
      return {
        ...state,
        documents: [doc, ...state.documents],
        activity: addActivity(state, `Added “${action.name}” to the Document Vault`),
      }
    }
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
    case 'reset':
      return initialState
    default:
      return state
  }
}

function loadState(): FamilyState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return initialState
    const parsed = JSON.parse(raw) as Partial<FamilyState>
    if (typeof parsed?.onboarded !== 'boolean') return initialState
    // v2 records predate the intelligence layer — upgrade them in place so
    // nobody loses their family record.
    if (parsed.version !== 2 && parsed.version !== VERSION) return initialState
    return {
      ...initialState,
      ...parsed,
      version: VERSION,
      activity: parsed.activity ?? [],
      aiMemory: { ...emptyAiMemory, ...(parsed.aiMemory ?? {}) },
    }
  } catch {
    return initialState
  }
}

interface FamilyContextValue {
  state: FamilyState
  dispatch: Dispatch<FamilyAction>
}

const FamilyContext = createContext<FamilyContextValue | null>(null)

export function FamilyProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, loadState)

  // Record this visit once per session — powers "since your last visit".
  const visited = useRef(false)
  useEffect(() => {
    if (visited.current) return
    visited.current = true
    dispatch({ type: 'visit', at: new Date().toISOString() })
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch {
      // Storage may be unavailable (private mode); the app still works for the session.
    }
  }, [state])

  const value = useMemo(() => ({ state, dispatch }), [state])
  return <FamilyContext.Provider value={value}>{children}</FamilyContext.Provider>
}

export function useFamily(): FamilyContextValue {
  const ctx = useContext(FamilyContext)
  if (!ctx) throw new Error('useFamily must be used inside <FamilyProvider>')
  return ctx
}
