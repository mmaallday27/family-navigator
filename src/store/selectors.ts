// Derived data. Every progress number, status, milestone date, and
// recommendation in the app is computed here from the family store —
// so the dashboard, journey map, transition navigator, and companion
// always agree with each other.

import { journeyStages, type StageStatus } from '../data/journey'
import { transitionTracks, type TransitionTrack } from '../data/transition'
import { supportedStates } from '../data/stateRegistry'
import type { ChildProfile, FamilyLocation, FamilyState } from './FamilyContext'

export function firstName(fullName: string): string {
  return fullName.trim().split(/\s+/)[0] ?? ''
}

export function initials(fullName: string): string {
  return fullName
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase() ?? '')
    .join('')
}

/** Replace {name} tokens in content strings with the child's first name. */
export function personalize(text: string, childName: string): string {
  return text.split('{name}').join(firstName(childName) || 'your child')
}

/**
 * A calm, human-scale duration for a span of days — "12 days", "about 3 weeks",
 * "about 1 month", "about 1.5 years". One shared voice, pluralized on the
 * rounded unit count, so every screen describes time the same way.
 */
export function roughlyLabel(days: number): string {
  if (days < 10) return `${days} ${days === 1 ? 'day' : 'days'}`
  if (days < 45) {
    const weeks = Math.round(days / 7)
    return `about ${weeks} ${weeks === 1 ? 'week' : 'weeks'}`
  }
  if (days < 365) {
    const months = Math.round(days / 30)
    return `about ${months} ${months === 1 ? 'month' : 'months'}`
  }
  const years = Math.round((days / 365) * 10) / 10
  return `about ${years} ${years === 1 ? 'year' : 'years'}`
}

/**
 * A human label for where the family lives — 'Rockland County, NY',
 * 'New York' (state only), or '' when they haven't said.
 */
export function locationLabel(location: FamilyLocation): string {
  if (!location.state) return ''
  const county = location.county.trim()
  if (!county) return supportedStates.find((s) => s.code === location.state)?.name ?? location.state
  const countyLabel = /county/i.test(county) ? county : `${county} County`
  return `${countyLabel}, ${location.state}`
}

// ---------------------------------------------------------------------------
// Birth month & year options — shared by onboarding and the profile editor so
// the birth date is always real (yyyy-mm-01), never fabricated from an age.
// ---------------------------------------------------------------------------

export const monthOptions = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]

/** Birth years spanning ages 0–40, newest first. */
export function birthYearOptions(now: Date = new Date()): number[] {
  const current = now.getFullYear()
  return Array.from({ length: 41 }, (_, i) => current - i)
}

/** Age today for a birth month (1–12) and year — for a live sanity check. */
export function ageFromMonthYear(month: number, year: number, now: Date = new Date()): number {
  let age = now.getFullYear() - year
  if (now.getMonth() + 1 < month) age -= 1
  return Math.max(0, age)
}

export function getAge(child: ChildProfile, now: Date = new Date()): number {
  const birth = new Date(`${child.birthDate}T00:00:00`)
  if (Number.isNaN(birth.getTime())) return 0
  let age = now.getFullYear() - birth.getFullYear()
  const beforeBirthday =
    now.getMonth() < birth.getMonth() ||
    (now.getMonth() === birth.getMonth() && now.getDate() < birth.getDate())
  if (beforeBirthday) age -= 1
  return Math.max(0, age)
}

/** Which lifecycle stage a child of this age is in. */
export function stageIdForAge(age: number): string {
  if (age < 3) return 'recognition'
  if (age < 6) return 'early'
  if (age < 14) return 'school'
  if (age < 22) return 'transition'
  return 'adult'
}

const stageOrder = journeyStages.map((s) => s.id)

export function stageStatus(stageId: string, currentStageId: string): StageStatus {
  if (stageId === 'legacy') return 'upcoming' // lifelong — runs alongside, never "behind you"
  const idx = stageOrder.indexOf(stageId)
  const cur = stageOrder.indexOf(currentStageId)
  if (idx < cur) return 'complete'
  if (idx === cur) return 'active'
  return 'upcoming'
}

export interface TrackProgress {
  done: number
  total: number
  pct: number
}

export function trackProgress(track: TransitionTrack, checks: Record<string, boolean>): TrackProgress {
  const done = track.checklist.filter((i) => checks[i.id]).length
  const total = track.checklist.length
  return { done, total, pct: total === 0 ? 0 : Math.round((done / total) * 100) }
}

/** Progress across the entire Transition stage (all tracks combined). */
export function transitionOverview(checks: Record<string, boolean>): TrackProgress & { open: number } {
  const all = transitionTracks.flatMap((t) => t.checklist)
  const done = all.filter((i) => checks[i.id]).length
  return {
    done,
    total: all.length,
    pct: all.length === 0 ? 0 : Math.round((done / all.length) * 100),
    open: all.length - done,
  }
}

/** The transition track that deserves this family's attention right now. */
export function currentTrack(age: number): TransitionTrack {
  if (age < 16) return transitionTracks[0] // Age 14 planning
  if (age < 19) return transitionTracks[1] // Age 18 decisions
  return transitionTracks[2] // Age 21/22 services cliff
}

/**
 * Progress for the child's CURRENT stage. Transition is fully instrumented via
 * checklists; other stages use a gentle baseline until they get the same depth.
 */
export function currentStageProgress(state: FamilyState, age: number): TrackProgress {
  const stageId = stageIdForAge(age)
  if (stageId === 'transition') {
    const o = transitionOverview(state.checks)
    return { done: o.done, total: o.total, pct: o.pct }
  }
  return { done: 0, total: 0, pct: 0 }
}

// ---------------------------------------------------------------------------
// Key moments — legal & service milestones derived from the child's birthday.
// ---------------------------------------------------------------------------

export interface Moment {
  id: string
  title: string
  dateLabel: string
  category: string
  urgent: boolean
  sort: number
}

const dateLabel = (d: Date) =>
  d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

export function keyMoments(child: ChildProfile, now: Date = new Date()): Moment[] {
  const birth = new Date(`${child.birthDate}T00:00:00`)
  if (Number.isNaN(birth.getTime())) return []
  const name = firstName(child.name) || 'Your child'
  const moments: Moment[] = []

  const milestone = (years: number, title: string, category: string, urgentWithinDays: number) => {
    const d = new Date(birth)
    d.setFullYear(birth.getFullYear() + years)
    if (d.getTime() <= now.getTime()) return
    const daysAway = Math.round((d.getTime() - now.getTime()) / 86_400_000)
    moments.push({
      id: `m${years}`,
      title,
      dateLabel: dateLabel(d),
      category,
      urgent: daysAway <= urgentWithinDays,
      sort: d.getTime(),
    })
  }

  milestone(14, `${name} turns 14 — transition planning joins the IEP`, 'School', 365)
  milestone(18, `${name} turns 18 — legal & benefits decisions take effect`, 'Legal', 365)
  milestone(22, `${name} turns 22 — school services end, adult services begin`, 'Adult services', 540)

  return moments
}

// ---------------------------------------------------------------------------
// The next-best-step engine. Recommendations are DERIVED from live state:
// unchecked items in the age-appropriate track, documents needing attention,
// and preparation prompts — so checking something off visibly changes the plan.
// ---------------------------------------------------------------------------

export interface NextStep {
  id: string
  title: string
  why: string
  module: string
  to: string
  minutes: number
}

export function nextBestSteps(state: FamilyState, now: Date = new Date()): NextStep[] {
  const age = getAge(state.child, now)
  const childFirst = firstName(state.child.name)
  const stageId = stageIdForAge(age)
  const steps: NextStep[] = []

  if (stageId === 'transition' || age >= 12) {
    // 1a. In (or approaching) transition: open items from the current track (up to 2).
    const track = currentTrack(age)
    const openItems = track.checklist.filter((i) => !state.checks[i.id])
    for (const item of openItems.slice(0, 2)) {
      steps.push({
        id: `check-${item.id}`,
        title: personalize(item.label, state.child.name),
        why: personalize(item.why ?? track.summary, state.child.name),
        module: 'Transition Navigator',
        to: '/transition',
        minutes: item.minutes ?? 10,
      })
    }
  } else {
    // 1b. Earlier stages: suggestions come from the current stage's guidance.
    const stage = journeyStages.find((s) => s.id === stageId)
    for (const step of (stage?.nextSteps ?? []).slice(0, 2)) {
      steps.push({
        id: `stage-${stageId}-${step}`,
        title: step,
        why: `Part of the ${stage?.title} stage — small moves now make the next stage much smoother.`,
        module: 'Journey Map',
        to: '/journey',
        minutes: 10,
      })
    }
  }

  // 2. A document that needs attention, if any.
  const flagged = state.documents.find((d) => d.flagged)
  if (flagged && steps.length < 3) {
    steps.push({
      id: `doc-${flagged.id}`,
      title: `Review “${flagged.name}”`,
      why: flagged.note ?? 'This document is flagged as needing your attention.',
      module: 'Document Vault',
      to: '/documents',
      minutes: 5,
    })
  }

  // 3. Preparation fallbacks so there are always three calm suggestions.
  if (steps.length < 3) {
    steps.push({
      id: 'companion-prep',
      title: 'Prepare questions for your next planning meeting',
      why: 'A focused agenda makes school and service meetings far more productive.',
      module: 'AI Companion',
      to: '/companion',
      minutes: 10,
    })
  }
  if (steps.length < 3) {
    steps.push({
      id: 'vault-start',
      title: state.documents.length === 0 ? 'Add your first document to the vault' : 'Keep the vault current',
      why: `Schools and services will ask for records — keeping ${childFirst || 'your child'}’s paperwork in one place saves future-you hours.`,
      module: 'Document Vault',
      to: '/documents',
      minutes: 5,
    })
  }
  if (steps.length < 3) {
    steps.push({
      id: 'journey-look',
      title: 'Look one stage ahead on the journey map',
      why: 'Ten minutes of looking ahead removes months of surprise later.',
      module: 'Journey Map',
      to: '/journey',
      minutes: 10,
    })
  }

  return steps.slice(0, 3)
}

// ---------------------------------------------------------------------------
// Onboarding support — concerns a family can pick, and the starter goals
// they seed. Chosen at /welcome, consumed by the dashboard from day one.
// ---------------------------------------------------------------------------

export interface ConcernOption {
  id: string
  label: string
  goal: { title: string; area: string }
}

export const concernOptions: ConcernOption[] = [
  {
    id: 'after-school',
    label: 'What comes after high school',
    goal: { title: 'Map what comes after high school', area: 'Adult services' },
  },
  {
    id: 'legal-18',
    label: 'Legal decisions at 18',
    goal: { title: 'Decide guardianship vs. supported decision-making', area: 'Age 18 planning' },
  },
  {
    id: 'benefits',
    label: 'Benefits (SSI / Medicaid)',
    goal: { title: 'Understand SSI & Medicaid under adult rules', area: 'Benefits' },
  },
  {
    id: 'employment',
    label: 'Employment & job readiness',
    goal: { title: 'Explore vocational assessments & job readiness', area: 'Employment readiness' },
  },
  {
    id: 'independence',
    label: 'Independent-living skills',
    goal: { title: 'Build a weekly independent-living skills routine', area: 'Independent living' },
  },
  {
    id: 'iep',
    label: 'The IEP & school supports',
    goal: { title: 'Strengthen IEP goals & accommodations', area: 'School' },
  },
  {
    id: 'housing',
    label: 'Housing someday',
    goal: { title: 'Learn about housing models & waitlists', area: 'Housing' },
  },
  {
    id: 'overwhelmed',
    label: 'Feeling overwhelmed or alone',
    goal: { title: 'Connect with a parent support group', area: 'Support' },
  },
]

export const strengthOptions = [
  'Visual thinking',
  'Amazing memory',
  'Deep focus on interests',
  'Honesty',
  'Kindness',
  'Humor',
  'Building things',
  'Music',
]

export const interestOptions = [
  'Trains & transit',
  'Animals',
  'Art & drawing',
  'Music',
  'Video games',
  'Cooking',
  'Sports & movement',
  'Nature',
]
