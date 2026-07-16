// The Look Ahead engine and the family timeline — the unknown, made visible.
// Look Ahead projects the road forward (30 days → 5 years) from the child's
// real birthday, the family's open preparation steps, and known deadlines.
// The timeline assembles the road already walked from the living record.

import type { FamilyState } from '../store/FamilyContext'
import { firstName, getAge, stageIdForAge } from '../store/selectors'
import { journeyStages } from '../data/journey'
import { stateGuidanceFor, type StateMilestone } from '../data/stateRegistry'
import { demoDeadlines, demoHistory } from '../data/demoFamily'

const MS_PER_DAY = 86_400_000

export type HorizonKind = 'legal' | 'school' | 'benefits' | 'preparation' | 'opportunity' | 'family'

export interface HorizonEvent {
  id: string
  title: string
  detail?: string
  dateLabel: string
  sort: number
  kind: HorizonKind
  to: string
  /** The ideal start date has already passed — starting now beats the rush. */
  startNow?: boolean
  /** Where this event comes from and when it was verified — rendered subtly. */
  sourceNote?: string
}

/** Best-fit horizon kind for a verified state milestone, from its wording —
 *  works for any registered state, no state-specific cases. */
function kindForStateMilestone(m: StateMilestone): HorizonKind {
  const text = `${m.id} ${m.title}`.toLowerCase()
  if (/\bssi\b|medicaid|benefit|\bable\b/.test(text)) return 'benefits'
  if (/iep|school|education|vocational assessment|transition planning|exit|diploma|graduat/.test(text)) return 'school'
  if (/guardian|decision-making|legal|rights/.test(text)) return 'legal'
  return 'preparation'
}

export interface Horizon {
  id: string
  label: string
  sub: string
  events: HorizonEvent[]
}

const fmt = (d: Date) =>
  d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
const fmtMonth = (d: Date) => d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

export function buildLookAhead(state: FamilyState, now: Date = new Date()): Horizon[] {
  const name = firstName(state.child.name)
  const age = getAge(state.child, now)
  const stageId = stageIdForAge(age)
  const birth = new Date(`${state.child.birthDate}T00:00:00`)
  const events: HorizonEvent[] = []
  if (Number.isNaN(birth.getTime())) return []

  const anniversary = (years: number) => {
    const d = new Date(birth)
    d.setFullYear(birth.getFullYear() + years)
    return d
  }
  const monthsBefore = (d: Date, months: number) => {
    const c = new Date(d)
    c.setMonth(c.getMonth() - months)
    return c
  }
  const inFuture = (d: Date) => d.getTime() > now.getTime()

  // Verified state milestones, projected onto the child's real birthdays.
  // Computed up front so the generic events below can defer to them (a family
  // in a deeply-mapped state gets the state's actual rule, not the national
  // approximation of it).
  const guidance = stateGuidanceFor(state.location.state)
  const stateEvents: { milestone: StateMilestone; date: Date }[] = (guidance?.milestones ?? [])
    .map((m) => ({ milestone: m, date: anniversary(m.age) }))
    .filter((e) => inFuture(e.date))
  /** A state milestone that will actually render already covers this topic. */
  const stateCovers = (re: RegExp, fromAge: number, toAge: number) =>
    stateEvents.some(({ milestone: m }) => m.age >= fromAge && m.age <= toAge && re.test(m.title))

  /** Push a preparation step with a lead time. If the ideal start has passed
   *  but the milestone hasn't, it lands in "now" — most families wait too long. */
  const prep = (
    id: string,
    checkId: string | null,
    idealStart: Date,
    milestone: Date,
    title: string,
    detail: string,
    kind: HorizonKind,
    to = '/transition',
  ) => {
    if (checkId && state.checks[checkId]) return
    if (!inFuture(milestone)) return
    if (inFuture(idealStart)) {
      events.push({ id, title, detail, dateLabel: `Around ${fmtMonth(idealStart)}`, sort: idealStart.getTime(), kind, to })
    } else {
      events.push({
        id,
        title,
        detail: `${detail} Most families start this later than they wish they had — beginning now typically reduces delays.`,
        dateLabel: 'Start now',
        sort: now.getTime(),
        kind,
        to,
        startNow: true,
      })
    }
  }

  // --- Fixed legal milestones, from the real birthday ---
  const b14 = anniversary(14)
  const b18 = anniversary(18)
  const b22 = anniversary(22)
  // Generic ages 14/18/22 defer to a state milestone on the same topic when
  // one will render — e.g. NY requires transition planning at 15, not the
  // federal framing, and NY school services now run to age 22.
  if (inFuture(b14) && !stateCovers(/transition planning/i, 12, 16))
    events.push({
      id: 'h-14',
      title: `${name} turns 14 — transition planning joins the IEP`,
      detail: 'The law requires transition goals in the IEP around this age. Arriving with a vision puts your family in the driver’s seat.',
      dateLabel: fmt(b14),
      sort: b14.getTime(),
      kind: 'legal',
      to: '/transition',
    })
  if (inFuture(b18))
    events.push({
      id: 'h-18',
      title: `${name} turns 18 — legal adulthood begins`,
      detail: 'Decision-making, benefits, and healthcare consent all change. Everything below this line prepares for this day.',
      dateLabel: fmt(b18),
      sort: b18.getTime(),
      kind: 'legal',
      to: '/transition',
    })
  if (inFuture(b22) && age >= 15 && !stateCovers(/school services|aging out/i, 21, 22))
    events.push({
      id: 'h-22',
      title: `${name} turns 22 — school services end, adult life begins`,
      detail: 'The entitlement era closes. What replaces it is whatever was applied for in the years before.',
      dateLabel: fmt(b22),
      sort: b22.getTime(),
      kind: 'legal',
      to: '/transition',
    })

  // The month after 18: SSI adult redetermination (unless the state's own
  // SSI-at-18 milestone is carrying this).
  if (inFuture(b18) && !stateCovers(/\bSSI\b/i, 18, 18)) {
    const redet = new Date(b18)
    redet.setMonth(redet.getMonth() + 1)
    events.push({
      id: 'h-ssi-redet',
      title: 'SSI is redetermined under adult rules',
      detail: `The month after the 18th birthday, ${name}’s eligibility is assessed on ${name}’s own finances — parental income stops counting.`,
      dateLabel: fmtMonth(redet),
      sort: redet.getTime(),
      kind: 'benefits',
      to: '/transition',
    })
  }

  // A regular birthday, when it isn't already a legal one.
  const nextBirthday = anniversary(age + 1)
  if (![14, 18, 22].includes(age + 1) && inFuture(nextBirthday)) {
    events.push({
      id: 'h-birthday',
      title: `${name} turns ${age + 1}`,
      detail: 'A natural moment to celebrate progress and refresh the goals.',
      dateLabel: fmt(nextBirthday),
      sort: nextBirthday.getTime(),
      kind: 'family',
      to: '/',
    })
  }

  // --- Preparation steps with honest lead times ---
  if (age >= 13 && inFuture(b18)) {
    prep(
      'h-prep-decision',
      'c18a',
      monthsBefore(b18, 18),
      b18,
      'Begin decision-making conversations (guardianship vs. alternatives)',
      'Courts and paperwork commonly take 3–6 months, and the thinking takes longer.',
      'preparation',
    )
    prep(
      'h-prep-ssi',
      'c18b',
      monthsBefore(b18, 12),
      b18,
      'Start SSI research under adult rules',
      'Understanding the adult rules early prevents a gap in support after the birthday.',
      'benefits',
    )
    prep(
      'h-prep-consent',
      'c18d',
      monthsBefore(b18, 6),
      b18,
      'Put healthcare consent / HIPAA paperwork in place',
      'Without it, medical information access can end abruptly on the birthday.',
      'preparation',
    )
    if (!state.checks['c18a']) {
      const signing = monthsBefore(b18, 3)
      if (inFuture(signing))
        events.push({
          id: 'h-signing-target',
          title: 'Target: legal documents signed and done',
          detail: 'A quiet buffer before the birthday means nothing is rushed at the end.',
          dateLabel: `By ${fmtMonth(signing)}`,
          sort: signing.getTime(),
          kind: 'preparation',
          to: '/transition',
        })
    }
  }
  if (age >= 15 && inFuture(b22)) {
    // The state's own VR-application milestone (e.g. NY's ACCES-VR at 16)
    // carries this topic when it will render.
    if (!stateCovers(/vocational rehabilitation|ACCES-VR|\bVR\b/i, 14, 22)) {
      prep(
        'h-prep-vr',
        'c21a',
        anniversary(17),
        b22,
        'Apply to Vocational Rehabilitation (VR)',
        'Best done before the final school year so employment support is seamless.',
        'preparation',
      )
    }
    prep(
      'h-prep-waiver',
      'c21b',
      anniversary(Math.max(14, Math.min(age, 16))),
      b22,
      'Get on adult-service / Medicaid waiver waitlists',
      'Waitlists can run years — every month on the list matters.',
      'benefits',
    )
  }
  if (stageId === 'transition' && age >= 16 && !state.documents.some((d) => d.categoryId === 'eval')) {
    events.push({
      id: 'h-reeval',
      title: 'Consider a fresh evaluation',
      detail: 'Adult services and VR usually want an evaluation from the last ~3 years — timing one around 16–17 covers the applications ahead.',
      dateLabel: 'Start now',
      sort: now.getTime(),
      kind: 'preparation',
      to: '/documents',
      startNow: true,
    })
  }

  // --- School rhythm (typical timing — confirm your school's calendar) ---
  if (age >= 5 && age < 22 && !state.isDemo) {
    events.push({
      id: 'h-iep-annual',
      title: 'Annual IEP review',
      detail: 'Typical timing — confirm your school’s calendar. Bring three wins and three concerns.',
      dateLabel: 'Within the school year',
      sort: now.getTime() + 120 * MS_PER_DAY,
      kind: 'school',
      to: '/documents',
    })
  }

  // --- Known dates from the demo family's record ---
  if (state.isDemo) {
    const kindByCategory: Record<string, HorizonKind> = {
      School: 'school',
      'Adult services': 'benefits',
      Employment: 'preparation',
      Legal: 'legal',
    }
    for (const d of demoDeadlines) {
      events.push({
        id: `h-${d.id}`,
        title: d.title,
        dateLabel: d.dateLabel,
        sort: d.sort === 0 ? now.getTime() : d.sort,
        kind: kindByCategory[d.category] ?? 'opportunity',
        to: d.category === 'School' ? '/documents' : '/transition',
        startNow: d.sort === 0,
      })
    }
  }

  // --- Verified state milestones, projected onto the real birthdays ---
  if (guidance) {
    for (const { milestone: m, date } of stateEvents) {
      events.push({
        id: `h-${m.id}`,
        title: `${guidance.displayName}: ${m.title}`,
        detail: m.action,
        dateLabel: fmt(date),
        sort: date.getTime(),
        kind: kindForStateMilestone(m),
        to: '/resources',
        sourceNote: `${m.source.name} · verified ${m.lastVerified}${m.verifyNote ? ` — ${m.verifyNote}` : ''}`,
      })
    }
  }

  // --- Dates the AI found inside the family's own documents ---
  // Only analysis digests that succeeded, only hard date kinds, only parseable
  // future dates — a document's deadline should never silently go missing, but
  // a garbled one should never fabricate urgency either.
  for (const doc of state.documents) {
    const insights = doc.insights
    if (!insights || insights.status !== 'ok' || !insights.dates) continue
    for (const [i, dt] of insights.dates.entries()) {
      if (dt.kind !== 'deadline' && dt.kind !== 'renewal' && dt.kind !== 'expiration') continue
      const d = new Date(dt.date)
      if (Number.isNaN(d.getTime()) || !inFuture(d)) continue
      events.push({
        id: `h-doc-${doc.id}-${i}`,
        title: `From ${doc.name}: ${dt.label}`,
        detail: dt.kind === 'renewal' ? 'A renewal date found in this document.' : dt.kind === 'expiration' ? 'An expiration date found in this document.' : 'A deadline found in this document.',
        dateLabel: fmt(d),
        sort: d.getTime(),
        kind: 'preparation',
        to: '/documents',
        sourceNote: dt.verifyNote
          ? `Found by document analysis — ${dt.verifyNote}`
          : 'Found by document analysis — verify against the original.',
      })
    }
  }

  // --- Next life stage, for younger children (the far horizon) ---
  const boundaries: Record<string, number> = { recognition: 3, early: 6, school: 14, transition: 22 }
  const boundaryAge = boundaries[stageId]
  if (boundaryAge && stageId !== 'transition') {
    const d = anniversary(boundaryAge)
    const order = journeyStages.map((s) => s.id)
    const nextStage = journeyStages[order.indexOf(stageId) + 1]
    if (inFuture(d) && nextStage) {
      events.push({
        id: 'h-next-stage',
        title: `The ${nextStage.title} stage begins`,
        detail: nextStage.tagline,
        dateLabel: `Around ${fmtMonth(d)}`,
        sort: d.getTime(),
        kind: 'family',
        to: '/journey',
      })
    }
  }

  // --- Assign to horizons ---
  const buckets: { id: string; label: string; sub: string; min: number; max: number }[] = [
    { id: '30d', label: 'Next 30 days', sub: 'Worth attention now', min: -1, max: 30 },
    { id: '90d', label: 'Next 90 days', sub: 'Coming into view', min: 30, max: 90 },
    { id: '6m', label: 'Next 6 months', sub: 'Time to prepare calmly', min: 90, max: 183 },
    { id: '1y', label: 'Within a year', sub: 'On the horizon', min: 183, max: 365 },
    // Open-ended: everything beyond a year belongs here, however far out —
    // a young child's next stage or an age-22 milestone must never vanish.
    { id: '5y', label: 'Beyond a year', sub: 'Mapped, so nothing surprises you', min: 365, max: Infinity },
  ]

  return buckets.map((b) => ({
    id: b.id,
    label: b.label,
    sub: b.sub,
    events: events
      .filter((e) => {
        const days = (e.sort - now.getTime()) / MS_PER_DAY
        return days > b.min && days <= b.max
      })
      .sort((a, z) => a.sort - z.sort),
  }))
}

// ---------------------------------------------------------------------------
// The road so far — a living history assembled from the family record.
// ---------------------------------------------------------------------------

export type TimelineKind = 'milestone' | 'document' | 'decision' | 'service' | 'record'

export interface TimelineEvent {
  id: string
  dateLabel: string
  sort: number
  title: string
  detail?: string
  kind: TimelineKind
}

export function buildTimeline(state: FamilyState, now: Date = new Date()): TimelineEvent[] {
  const name = firstName(state.child.name)
  const birth = new Date(`${state.child.birthDate}T00:00:00`)
  const events: TimelineEvent[] = []

  if (!Number.isNaN(birth.getTime())) {
    events.push({
      id: 't-birth',
      dateLabel: String(birth.getFullYear()),
      sort: birth.getTime(),
      title: `${name} was born`,
      detail: 'Where the road begins.',
      kind: 'milestone',
    })
    // Only trust the structured "Age N" form — free text ("2013", "around
    // kindergarten") would produce a nonsense year, so we skip it instead.
    const diagAge = state.child.diagnosedAt.trim().match(/^age\s*(\d{1,2})$/i)
    if (diagAge) {
      const d = new Date(birth)
      d.setFullYear(birth.getFullYear() + Math.min(30, Number(diagAge[1])))
      events.push({
        id: 't-diagnosis',
        dateLabel: String(d.getFullYear()),
        sort: d.getTime(),
        title: `Diagnosis received (${state.child.diagnosedAt.toLowerCase()})`,
        detail: 'The moment the map became necessary — and the journey got a name.',
        kind: 'milestone',
      })
    }
  }

  if (state.isDemo) {
    events.push(...demoHistory)
  }

  for (const a of state.activity) {
    const when = new Date(a.when)
    const kind: TimelineKind = a.text.startsWith('Added “')
      ? 'document'
      : a.text.startsWith('Completed “')
        ? 'milestone'
        : 'record'
    events.push({
      id: a.id,
      dateLabel: when.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      sort: when.getTime(),
      title: a.text,
      kind,
    })
  }

  return events.filter((e) => e.sort <= now.getTime()).sort((a, b) => a.sort - b.sort)
}
