// Scenario planning — "what happens if…". The companion explains possible
// paths without choosing for the family. Every scenario is personalized from
// the record (name, age, real dates) and ends with the professional to involve.

import type { CompanionResponse } from '../data/companion'
import type { FamilyState } from '../store/FamilyContext'
import { firstName, keyMoments } from '../store/selectors'

export interface Scenario {
  id: string
  match: string[]
  prompt: string
  build: (state: FamilyState, now: Date) => CompanionResponse
}

export const scenarios: Scenario[] = [
  {
    id: 'turns-18',
    match: ['turns 18', 'turn 18', 'turning 18', 'when he turns 18', 'when she turns 18', 'at 18'],
    prompt: 'What happens when {name} turns 18?',
    build: (state, now) => {
      const name = firstName(state.child.name)
      const m18 = keyMoments(state.child, now).find((m) => m.id === 'm18')
      return {
        kind: 'record',
        intro: `On ${m18 ? m18.dateLabel : 'the 18th birthday'}, ${name} becomes a legal adult. Nothing about who ${name} is changes that day — but several systems change how they treat your family. Here’s the honest map.`,
        sections: [
          {
            heading: 'What changes automatically',
            items: [
              `You lose automatic access to ${name}’s medical, school, and financial information unless consent documents are in place`,
              'SSI eligibility is re-determined under adult rules (parental income stops counting — some who were denied as children qualify as adults)',
              `${name} can sign contracts, vote, and consent to (or decline) their own care`,
            ],
          },
          {
            heading: 'Paths families take on decision-making',
            items: [
              'Supported decision-making: ' + name + ' keeps legal rights, with a trusted team formally named — the least restrictive path',
              'Powers of attorney / healthcare proxy: ' + name + ' voluntarily delegates specific decisions',
              'Guardianship (full or limited): a court transfers decision rights — the most protective and most restrictive path',
            ],
          },
          {
            heading: 'What doesn’t change',
            items: [
              'School services continue if ' + name + ' is still enrolled (until 21/22)',
              'The IEP stays in force',
              'Your role as the person who knows ' + name + ' best',
            ],
          },
        ],
        points: [],
        nextSteps: state.checks['c18a']
          ? ['Your decision-making step is already checked off — review the paperwork timing with your attorney']
          : ['Open the Age 18 track and work through the five preparation steps', 'Book the attorney consultation early — court calendars are slow'],
        moduleLink: { label: 'Open the Age 18 track', to: '/transition' },
        professionalNote:
          'Decision-making authority and benefits eligibility are legal determinations — a special-needs attorney and a benefits counselor should be part of this. I can help you prepare the questions.',
      }
    },
  },
  {
    id: 'ssi-denied',
    match: ['ssi is denied', 'ssi denied', 'denied ssi', 'if ssi', 'benefits are denied', 'denied benefits'],
    prompt: 'What happens if SSI is denied?',
    build: (state) => {
      const name = firstName(state.child.name)
      return {
        kind: 'educational',
        intro: `First: an SSI denial is common and often reversible. A majority of initial applications are denied, and many succeed on appeal. It’s a step in the process, not the end of it.`,
        sections: [
          {
            heading: 'The appeal ladder',
            items: [
              'Reconsideration — a fresh review; file within the window printed on the letter (commonly 60 days)',
              'Hearing before an administrative law judge — where many denials are overturned',
              'Appeals Council and federal court — rarely needed, but the ladder exists',
            ],
          },
          {
            heading: 'What strengthens an appeal',
            items: [
              'The exact denial reason from the letter — answer that, specifically',
              `Recent evaluations and provider letters describing ${name}’s day-to-day support needs (not just diagnoses)`,
              'A benefits counselor or attorney — SSI appeals are their daily work, often free or contingency-based',
            ],
          },
          {
            heading: 'Meanwhile',
            items: [
              'Medicaid pathways may exist independently of SSI — a denial of one is not a denial of the other',
              'Keep every letter — the paper trail is the case',
            ],
          },
        ],
        points: [],
        nextSteps: ['If a denial letter arrives, add it to the Document Vault — I’ll flag the deadline pattern', 'Find your Parent Training & Information Center — they walk families through appeals for free'],
        moduleLink: { label: 'Find benefits help in Resources', to: '/resources' },
        professionalNote:
          'Appeal deadlines are strict and printed on the letter itself. A benefits counselor should review the actual denial before you respond.',
      }
    },
  },
  {
    id: 'after-graduation',
    match: ['after graduation', 'graduates', 'after high school', 'school ends', 'services cliff', 'after school ends'],
    prompt: 'What happens after school services end?',
    build: (state, now) => {
      const name = firstName(state.child.name)
      const m22 = keyMoments(state.child, now).find((m) => m.id === 'm22')
      return {
        kind: 'record',
        intro: `School services are an entitlement — they end (${m22 ? m22.dateLabel : 'around age 21–22'}) whether or not anything replaces them. Adult services are applied for. That gap is called the “services cliff,” and it’s the single most predictable crisis on the road — which means it’s preventable.`,
        sections: [
          {
            heading: 'What replaces school, if you apply',
            items: [
              'Vocational Rehabilitation: job assessment, training, and supported employment',
              'Medicaid waivers: fund day programs, community supports, and job coaching (waitlists run long — years in many states)',
              'Post-secondary programs: inclusive college programs and life-skills certificates exist in most states',
            ],
          },
          {
            heading: 'The one question that organizes everything',
            items: [
              `“What is ${name}’s plan for the first Monday after school ends?” — employment, a program, education, or structured days at home. Build backward from that answer.`,
            ],
          },
        ],
        points: [],
        nextSteps: [
          state.checks['c21b'] ? 'You’re already on waiver waitlists — confirm your position annually' : 'Get on waiver waitlists now; every month matters',
          state.checks['c21a'] ? 'VR application is done — schedule the intake follow-up' : 'Apply to VR before the final school year',
        ],
        moduleLink: { label: 'Open the Age 21/22 track', to: '/transition' },
        professionalNote: 'Your school’s transition coordinator and your regional adult-services agency own these handoffs — bring them in early.',
      }
    },
  },
  {
    id: 'move-states',
    match: ['move to another state', 'moving states', 'if we move', 'another state', 'relocate'],
    prompt: 'What if we move to another state?',
    build: (state) => {
      const name = firstName(state.child.name)
      return {
        kind: 'educational',
        intro: `Moving states is doable, but disability services are state-administered — some things travel with you and some restart. Knowing which is which before you move protects ${name} from a gap.`,
        sections: [
          {
            heading: 'Travels with you',
            items: [
              'SSI (federal) — though the payment amount may change with state supplements',
              'The IEP’s legal force — the new district must provide comparable services while it re-evaluates',
              `Your documents — this vault becomes priceless in a move`,
            ],
          },
          {
            heading: 'Restarts in the new state',
            items: [
              'Medicaid waivers — waitlists do NOT transfer; you join the new state’s line',
              'Guardianship/supported decision-making may need to be registered or re-established',
              'Provider relationships, adult-service agencies, and VR cases',
            ],
          },
          {
            heading: 'Before committing to a move',
            items: [
              'Research the destination state’s waiver waitlist length — it varies from months to a decade',
              'Contact the new state’s Parent Training & Information Center before the move',
            ],
          },
        ],
        points: [],
        nextSteps: ['Keep every document current in the vault — a move is when the record earns its keep'],
        moduleLink: { label: 'Review your Document Vault', to: '/documents' },
        professionalNote: 'Waiver portability and legal registrations are state-specific — consult the destination state’s disability services agency and an attorney licensed there.',
      }
    },
  },
  {
    id: 'no-guardianship',
    match: ["don't pursue guardianship", 'not pursue guardianship', 'skip guardianship', 'without guardianship', 'no guardianship'],
    prompt: 'What if we don’t pursue guardianship?',
    build: (state) => {
      const name = firstName(state.child.name)
      return {
        kind: 'educational',
        intro: `Not pursuing guardianship is a legitimate, increasingly common choice — many families find less restrictive tools cover their real needs. The question isn’t “guardianship or nothing”; it’s “which decisions need support, and what’s the lightest tool that covers each one?”`,
        sections: [
          {
            heading: 'The alternatives, lightest first',
            items: [
              `Supported decision-making agreement: ${name} formally names trusted supporters — recognized by statute in a growing number of states`,
              'HIPAA authorization + healthcare proxy: keeps you in medical conversations',
              'Durable power of attorney: ' + name + ' delegates finances or specific matters, revocably',
              'Representative payee: manages benefit payments only',
            ],
          },
          {
            heading: 'The honest tradeoffs',
            items: [
              `These tools require ${name} to have capacity to sign, and cooperation to keep working`,
              'Some institutions (banks, hospitals) are slower to honor alternatives than court orders',
              'Guardianship can be added later if genuinely needed — it’s much harder to remove',
            ],
          },
        ],
        points: [],
        nextSteps: ['List the actual decisions ' + name + ' will need support with — that list drives the tool choice', 'Bring the list to a special-needs attorney'],
        moduleLink: { label: 'Open the Age 18 track', to: '/transition' },
        professionalNote: 'Capacity and the enforceability of alternatives are legal judgments — this decision deserves an attorney conversation. I can help you build the decision list to bring.',
      }
    },
  },
]

export function matchScenario(input: string): Scenario | undefined {
  const q = input.toLowerCase()
  const isScenarioShaped = q.includes('what happens') || q.includes('what if') || q.includes('what would happen')
  return scenarios.find(
    (s) => s.match.some((m) => q.includes(m)) && (isScenarioShaped || s.match.some((m) => q.includes(m) && m.length > 8)),
  )
}
