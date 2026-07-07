// The proactive reasoning engine. It continuously evaluates the family record
// — age, stage, checklists, documents, goals, saved resources, team — and
// surfaces what matters before anyone asks. Every insight carries a trust
// marker: is this a fact from the record, or a suggestion?

import { journeyStages } from '../data/journey'
import { transitionTracks } from '../data/transition'
import { resources, type Resource } from '../data/resources'
import type { FamilyState } from '../store/FamilyContext'
import {
  currentTrack,
  firstName,
  getAge,
  personalize,
  stageIdForAge,
  trackProgress,
  transitionOverview,
} from '../store/selectors'

export type InsightKind = 'deadline' | 'risk' | 'action' | 'opportunity' | 'celebration'

export interface Insight {
  id: string
  kind: InsightKind
  title: string
  body: string
  to: string
  linkLabel: string
  minutes?: number
  /** Higher = surfaces first. Deadlines & risks outrank opportunities. */
  priority: number
  /** Trust layer: true = computed fact from the record; false = suggestion. */
  isFact: boolean
}

const MS_PER_DAY = 86_400_000

function birthdayInfo(state: FamilyState, years: number, now: Date) {
  const birth = new Date(`${state.child.birthDate}T00:00:00`)
  if (Number.isNaN(birth.getTime())) return null
  const d = new Date(birth)
  d.setFullYear(birth.getFullYear() + years)
  const daysAway = Math.round((d.getTime() - now.getTime()) / MS_PER_DAY)
  return {
    date: d,
    daysAway,
    label: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    roughly:
      daysAway < 45
        ? `${daysAway} days`
        : daysAway < 365
          ? `about ${Math.round(daysAway / 30)} months`
          : `about ${Math.round((daysAway / 365) * 10) / 10} years`,
  }
}

// ---------------------------------------------------------------------------
// Resource matching — which programs fit THIS family right now, and why.
// ---------------------------------------------------------------------------

export interface ResourceMatch {
  resource: Resource
  reason: string
  score: number
}

export function matchResources(state: FamilyState, now: Date = new Date()): ResourceMatch[] {
  const age = getAge(state.child, now)
  const stageId = stageIdForAge(age)
  const name = firstName(state.child.name)
  const matches: ResourceMatch[] = []

  for (const r of resources) {
    if (state.savedResources.includes(r.id)) continue
    let score = 0
    const reasons: string[] = []

    if (r.stages.includes(stageId)) score += 2
    const concernHits = r.concernIds.filter((c) => state.concerns.includes(c))
    if (concernHits.length > 0) {
      score += 2 * concernHits.length
      reasons.push('matches what you said is on your mind')
    }
    // Gap-specific boosts — the record shows an unmet need this resource serves.
    if (r.typeId === 'legal' && !state.checks['c18a'] && age >= 14 && age < 18) {
      score += 3
      reasons.push(`a decision-making approach isn’t chosen yet, and ${name} turns 18 ${birthdayInfo(state, 18, now)?.roughly ?? 'soon'} from now`)
    }
    if (r.typeId === 'vocational' && age >= 14 && (!state.checks['c21a'] || !state.checks['c14e'])) {
      score += 3
      reasons.push('employment preparation steps are still open')
    }
    if (r.typeId === 'transition' && stageId === 'transition' && transitionOverview(state.checks).pct < 50) {
      score += 2
      reasons.push('a coordinator can help carry the transition planning load')
    }
    if (r.typeId === 'parent' && state.concerns.includes('overwhelmed')) {
      score += 3
      reasons.push('you mentioned feeling overwhelmed — other parents are the best co-navigators')
    }
    if (r.addedRecently) score += 1

    if (score >= 3) {
      matches.push({
        resource: r,
        reason: reasons[0] ?? `relevant to the ${journeyStages.find((s) => s.id === stageId)?.title} stage`,
        score,
      })
    }
  }

  return matches.sort((a, b) => b.score - a.score)
}

// ---------------------------------------------------------------------------
// Vault intelligence — what the record is missing for this stage.
// ---------------------------------------------------------------------------

export interface VaultGap {
  id: string
  label: string
  why: string
}

export function vaultGaps(state: FamilyState, now: Date = new Date()): VaultGap[] {
  const age = getAge(state.child, now)
  const stageId = stageIdForAge(age)
  const has = (categoryId: string) => state.documents.some((d) => d.categoryId === categoryId)
  const gaps: VaultGap[] = []

  if (stageId === 'transition') {
    if (!has('transition'))
      gaps.push({
        id: 'gap-transition',
        label: 'No transition plan on file',
        why: 'The IEP transition plan is the backbone document for ages 14–22 — schools and agencies will ask for it.',
      })
    if (!has('eval'))
      gaps.push({
        id: 'gap-eval',
        label: 'No evaluation on file',
        why: 'Adult services and VR usually want a recent evaluation (often within ~3 years).',
      })
    if (age >= 16 && !has('benefits'))
      gaps.push({
        id: 'gap-benefits',
        label: 'No benefits paperwork yet',
        why: 'SSI research and application records become important before the 18th birthday.',
      })
  }
  if (stageId === 'school' && !has('iep'))
    gaps.push({
      id: 'gap-iep',
      label: 'No IEP on file',
      why: 'Keeping the current IEP here means it’s ready for every meeting and evaluation.',
    })

  return gaps
}

// ---------------------------------------------------------------------------
// The engine — derive everything worth knowing, ranked.
// ---------------------------------------------------------------------------

export function deriveInsights(state: FamilyState, now: Date = new Date()): Insight[] {
  const age = getAge(state.child, now)
  const stageId = stageIdForAge(age)
  const name = firstName(state.child.name)
  const insights: Insight[] = []

  // 1. Age-triggered legal deadlines (facts from the record).
  const b18 = birthdayInfo(state, 18, now)
  if (b18 && b18.daysAway > 0 && b18.daysAway <= 730) {
    insights.push({
      id: 'age18-approaching',
      kind: 'deadline',
      title: `${name} turns 18 in ${b18.roughly} (${b18.label})`,
      body: 'Legal adulthood changes decision-making, benefits, and healthcare consent. The paperwork takes months — this is the season to prepare.',
      to: '/transition',
      linkLabel: 'Open the Age 18 track',
      priority: b18.daysAway < 365 ? 95 : 80,
      isFact: true,
    })
    if (!state.checks['c18a']) {
      insights.push({
        id: 'risk-no-decision-approach',
        kind: 'risk',
        title: 'No decision-making approach chosen yet',
        body: `Guardianship vs. supported decision-making needs to be settled before the 18th birthday — courts and paperwork commonly take 3–6 months. Worth starting the attorney conversation now.`,
        to: '/transition',
        linkLabel: 'See what’s involved',
        minutes: 20,
        priority: b18.daysAway < 365 ? 92 : 75,
        isFact: false,
      })
    }
    if (!state.checks['c18b']) {
      insights.push({
        id: 'risk-ssi-unresearched',
        kind: 'risk',
        title: 'SSI planning should begin before 18',
        body: 'SSI is re-evaluated under adult rules the month after the 18th birthday. Families who research early avoid a gap in support.',
        to: '/transition',
        linkLabel: 'Start SSI research',
        minutes: 15,
        priority: 85,
        isFact: false,
      })
    }
  }
  const b14 = birthdayInfo(state, 14, now)
  if (b14 && b14.daysAway > 0 && b14.daysAway <= 365) {
    insights.push({
      id: 'age14-approaching',
      kind: 'deadline',
      title: `${name} turns 14 in ${b14.roughly} — transition planning joins the IEP`,
      body: 'Around 14, the IEP must include transition goals. Arriving at that meeting with a vision puts your family in the driver’s seat.',
      to: '/transition',
      linkLabel: 'Preview the Age 14 track',
      priority: 88,
      isFact: true,
    })
  }
  const b22 = birthdayInfo(state, 22, now)
  if (b22 && b22.daysAway > 0 && b22.daysAway <= 730 && age >= 19) {
    insights.push({
      id: 'age22-approaching',
      kind: 'deadline',
      title: `School services end in ${b22.roughly} (${b22.label})`,
      body: 'Adult services are applied for, not automatic. Waitlists can run years — every month on a list matters.',
      to: '/transition',
      linkLabel: 'Open the Age 21/22 track',
      priority: 94,
      isFact: true,
    })
  }

  // 2. The next open preparation steps in the current track. Steps already
  // covered by a higher-priority risk (guardianship, SSI) are not repeated.
  if (stageId === 'transition' || age >= 12) {
    const track = currentTrack(age)
    const coveredByRisk: Record<string, string> = {
      c18a: 'risk-no-decision-approach',
      c18b: 'risk-ssi-unresearched',
    }
    const open = track.checklist.filter(
      (i) => !state.checks[i.id] && !insights.some((x) => x.id === coveredByRisk[i.id]),
    )
    for (const item of open.slice(0, 2)) {
      insights.push({
        id: `step-${item.id}`,
        kind: 'action',
        title: personalize(item.label, state.child.name),
        body: personalize(item.why ?? track.summary, state.child.name),
        to: '/transition',
        linkLabel: 'Open the checklist',
        minutes: item.minutes ?? 10,
        priority: 70 - open.indexOf(item),
        isFact: false,
      })
    }
    const p = trackProgress(track, state.checks)
    if (p.total > 0 && p.done === p.total) {
      insights.push({
        id: `celebrate-${track.id}`,
        kind: 'celebration',
        title: `The ${track.age} track is fully prepared — well done`,
        body: 'Every step in this track is checked off. When you’re ready, the next track is waiting — no rush.',
        to: '/transition',
        linkLabel: 'See what’s next',
        priority: 45,
        isFact: true,
      })
    }
  } else {
    const stage = journeyStages.find((s) => s.id === stageId)
    for (const [i, step] of (stage?.nextSteps ?? []).slice(0, 2).entries()) {
      insights.push({
        id: `stage-step-${stageId}-${i}`,
        kind: 'action',
        title: step,
        body: `Part of the ${stage?.title} stage — small moves now make the next stage much smoother.`,
        to: '/journey',
        linkLabel: 'See this stage',
        minutes: 10,
        priority: 70 - i,
        isFact: false,
      })
    }
  }

  // 3. Documents needing attention (facts — they're flagged in the vault).
  for (const doc of state.documents.filter((d) => d.flagged).slice(0, 2)) {
    insights.push({
      id: `doc-${doc.id}`,
      kind: 'action',
      title: `“${doc.name}” needs your attention`,
      body: doc.note ?? 'This document is flagged in your vault.',
      to: '/documents',
      linkLabel: 'Open the vault',
      minutes: 5,
      priority: 72,
      isFact: true,
    })
  }

  // 4. Gaps in the record for this stage.
  for (const gap of vaultGaps(state, now).slice(0, 1)) {
    insights.push({
      id: gap.id,
      kind: 'risk',
      title: gap.label,
      body: gap.why,
      to: '/documents',
      linkLabel: 'Add it to the vault',
      minutes: 5,
      priority: 60,
      isFact: true,
    })
  }

  // 5. Programs that match this family's profile.
  const matched = matchResources(state, now)
  const newOnes = matched.filter((m) => m.resource.addedRecently)
  if (newOnes.length > 0) {
    insights.push({
      id: 'resources-new',
      kind: 'opportunity',
      title: `${newOnes.length} new ${newOnes.length === 1 ? 'program matches' : 'programs match'} ${name}’s profile`,
      body: newOnes.map((m) => m.resource.name).join(' · '),
      to: '/resources',
      linkLabel: 'See the matches',
      minutes: 5,
      priority: 55,
      isFact: true,
    })
  } else if (matched.length > 0) {
    insights.push({
      id: 'resources-match',
      kind: 'opportunity',
      title: `${matched.length} ${matched.length === 1 ? 'program matches' : 'programs match'} ${name}’s profile`,
      body: `Top match: ${matched[0].resource.name} — ${matched[0].reason}.`,
      to: '/resources',
      linkLabel: 'See the matches',
      minutes: 5,
      priority: 50,
      isFact: false,
    })
  }

  // 6. Team gaps — the right partner at the right moment.
  if (!state.isDemo && stageId === 'transition' && age >= 15 && !state.checks['c18a']) {
    insights.push({
      id: 'team-attorney-gap',
      kind: 'opportunity',
      title: 'No attorney in your circle yet',
      body: 'A special-needs attorney helps settle the age-18 decision-making question. Families usually start this conversation around 16.',
      to: '/family',
      linkLabel: 'See your team',
      priority: 58,
      isFact: true,
    })
  }

  return insights
    .filter((i) => !state.aiMemory.dismissedInsights.includes(i.id))
    .sort((a, b) => b.priority - a.priority)
}

// ---------------------------------------------------------------------------
// The Family Executive Briefing — the emotional center of the product.
// ---------------------------------------------------------------------------

export interface Briefing {
  greeting: string
  narrative: string
  priorities: Insight[]
  watchouts: Insight[]
  totalMinutes: number
  newSinceLastVisit: string[]
  lastVisitLabel: string | null
}

export function buildBriefing(state: FamilyState, now: Date = new Date()): Briefing {
  const h = now.getHours()
  const timeOfDay = h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening'
  const age = getAge(state.child, now)
  const stage = journeyStages.find((s) => s.id === stageIdForAge(age))!
  const name = firstName(state.child.name)

  const all = deriveInsights(state, now)
  const priorities = all.filter((i) => i.kind === 'action' || i.kind === 'risk').slice(0, 4)
  const watchouts = all.filter((i) => !priorities.includes(i)).slice(0, 3)
  const totalMinutes = priorities.reduce((sum, i) => sum + (i.minutes ?? 10), 0)

  const newSince: string[] = []
  const newMatches = matchResources(state, now).filter((m) => m.resource.addedRecently)
  if (newMatches.length > 0) {
    newSince.push(
      `${newMatches.length} new ${newMatches.length === 1 ? 'resource' : 'resources'} became available that fit ${name}: ${newMatches.map((m) => m.resource.name).join(' and ')}.`,
    )
  }

  const prev = state.aiMemory.previousVisit
  const lastVisitLabel = prev
    ? new Date(prev).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    : null

  const overview = stageIdForAge(age) === 'transition' ? transitionOverview(state.checks) : null
  const narrative = overview
    ? `Based on where ${name} is in the ${stage.title} stage — ${overview.done} of ${overview.total} preparation steps done — here’s what deserves attention this week.`
    : `Based on where ${name} is in the ${stage.title} stage, here’s what deserves attention this week.`

  return {
    greeting: `${timeOfDay}, ${firstName(state.parent.name)}.`,
    narrative,
    priorities,
    watchouts,
    totalMinutes,
    newSinceLastVisit: newSince,
    lastVisitLabel,
  }
}

// ---------------------------------------------------------------------------
// Next milestone — powers the Journey Map's contextual note.
// ---------------------------------------------------------------------------

export function nextMilestone(state: FamilyState, now: Date = new Date()): string {
  const age = getAge(state.child, now)
  const stageId = stageIdForAge(age)
  const name = firstName(state.child.name)

  if (stageId === 'transition') {
    for (const t of transitionTracks) {
      if (age < t.anchorAge) {
        const b = birthdayInfo(state, t.anchorAge, now)
        return `${t.age}: ${t.title} — ${b ? `in ${b.roughly} (${b.label})` : 'coming up'}.`
      }
    }
    const b22 = birthdayInfo(state, 22, now)
    return `Age 22: school services end and adult services begin${b22 && b22.daysAway > 0 ? ` — in ${b22.roughly} (${b22.label})` : ''}.`
  }

  const order = journeyStages.map((s) => s.id)
  const nextStage = journeyStages[order.indexOf(stageId) + 1]
  if (!nextStage) return `Keep strengthening ${name}’s supports — the map is here whenever you need it.`
  const boundary: Record<string, number> = { early: 3, school: 5, transition: 14, adult: 22 }
  const yearsToNext = boundary[nextStage.id] !== undefined ? boundary[nextStage.id] - age : null
  return `Next stage: ${nextStage.title} (ages ${nextStage.ageRange})${
    yearsToNext !== null && yearsToNext > 0 ? ` — about ${yearsToNext} ${yearsToNext === 1 ? 'year' : 'years'} away` : ''
  }. Nothing to do there yet; knowing it’s mapped is enough.`
}
