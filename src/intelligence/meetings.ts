// Meeting preparation. For any meeting on this road — IEP, attorney, benefits,
// medical — the platform generates a personalized kit: agenda, questions built
// from the family's open items, documents cross-checked against the actual
// vault, and follow-ups that flow back into the record.

import type { CompanionResponse } from '../data/companion'
import type { FamilyState } from '../store/FamilyContext'
import { firstName, getAge, personalize } from '../store/selectors'

export type MeetingType = 'iep' | 'attorney' | 'benefits' | 'medical'

interface KitSpec {
  title: string
  agenda: (state: FamilyState, name: string) => string[]
  questions: (state: FamilyState, name: string) => string[]
  documents: string[] // category ids to cross-check against the vault
  documentLabels: Record<string, string>
  followUps: string[]
  professionalNote?: string
}

const kits: Record<MeetingType, KitSpec> = {
  iep: {
    title: 'IEP / transition meeting',
    agenda: (state, name) => {
      const age = getAge(state.child)
      return [
        `Progress since the last meeting — what’s working for ${name}`,
        age >= 13 ? 'Transition goals: education/training, employment, independent living' : 'Goals and accommodations for the coming term',
        'Services: minutes, frequency, and who delivers them',
        `${name}’s strengths and interests — and how goals build on them`,
        'Parent concerns (get them recorded in the document)',
        'Next steps, owners, and dates before everyone leaves the room',
      ]
    },
    questions: (state, name) => {
      const qs: string[] = []
      const age = getAge(state.child)
      if (age >= 13 && !state.checks['c14a']) qs.push('What measurable transition goals will we add, in all three required areas?')
      if (age >= 13 && !state.checks['c14e']) qs.push(`When can ${name} get a vocational or interest assessment?`)
      if (age >= 15) qs.push('Who is our connection point to VR and adult services, and when does that referral happen?')
      qs.push('How will we measure progress between now and the next review?')
      qs.push(`How is ${name} being included in these decisions?`)
      return qs
    },
    documents: ['iep', 'eval', 'transition'],
    documentLabels: { iep: 'Current IEP', eval: 'Most recent evaluation', transition: 'Transition plan / assessments' },
    followUps: [
      'Save the new IEP to the Document Vault when it arrives',
      'Check off any transition items the meeting resolved',
      'Note who owns each action item — and the date you’ll follow up',
    ],
  },
  attorney: {
    title: 'Special-needs attorney consultation',
    agenda: (_state, name) => [
      `${name}’s situation in five minutes: age, capacity, day-to-day decision needs`,
      'Decision-making options: supported decision-making, POA, guardianship',
      'Benefits protection: special needs trust, ABLE account',
      'Timeline and costs — what has to happen before the 18th birthday',
    ],
    questions: (state, name) => {
      const qs = [
        `Given ${name}’s actual decision-making needs, what’s the least restrictive arrangement you’d consider?`,
        'What does the timeline look like from engagement to signed documents?',
        'What will this cost, and what parts can we prepare ourselves?',
      ]
      if (!state.checks['c18d']) qs.push('What healthcare consent documents should be in place at 18?')
      qs.push('What do families in our situation most often get wrong or do too late?')
      return qs
    },
    documents: ['eval', 'legal', 'benefits'],
    documentLabels: { eval: 'Recent evaluation (capacity context)', legal: 'Any existing legal documents', benefits: 'Benefits paperwork' },
    followUps: [
      'Add the engagement letter and drafts to the Document Vault (Legal)',
      'Check off “compare guardianship vs. supported decision-making” once you’ve chosen a direction',
      'Calendar the signing and court dates the attorney gives you',
    ],
    professionalNote: 'This kit prepares you for legal advice — it isn’t legal advice itself.',
  },
  benefits: {
    title: 'Benefits interview / SSI appointment',
    agenda: (_state, name) => [
      'Identity and eligibility documents review',
      `${name}’s functional limitations in day-to-day terms — what support actually looks like`,
      'Income and resources (the adult rules count differently at 18)',
      'What happens next and when a decision is expected',
    ],
    questions: () => [
      'What documentation is missing from our file, if any?',
      'When should we expect a decision, and how will we be notified?',
      'If denied, what are the exact appeal steps and deadlines?',
      'Does this application affect Medicaid or waiver status in any way?',
    ],
    documents: ['eval', 'medical', 'benefits'],
    documentLabels: { eval: 'Recent evaluation', medical: 'Medical summary & medication list', benefits: 'Prior benefits correspondence' },
    followUps: [
      'Add every letter you receive to the vault — the paper trail is the case',
      'Note the case number and your interviewer’s name in the document note',
    ],
    professionalNote: 'Answer functionally, not optimistically — describe a hard day, not a good one. A benefits counselor can rehearse this with you.',
  },
  medical: {
    title: 'Medical appointment',
    agenda: (_state, name) => [
      'What changed since the last visit',
      'Current medications and anything that isn’t working',
      `${name}’s own questions and preferences — practice self-advocacy here`,
      'Transition to adult healthcare (if approaching 18)',
    ],
    questions: (state, name) => {
      const qs = [`What should we watch for between now and the next visit?`]
      const age = getAge(state.child)
      if (age >= 16) {
        qs.push(`How do we transition ${name} to adult providers, and when?`)
        if (!state.checks['c18d']) qs.push('What consent forms should be in place before 18 so we stay in the loop?')
      }
      return qs
    },
    documents: ['medical', 'therapy'],
    documentLabels: { medical: 'Medical summary & medication list', therapy: 'Recent therapy reports' },
    followUps: ['Update the medication list in the vault if anything changed', 'Add the visit summary when it arrives'],
  },
}

export function detectMeetingType(input: string): MeetingType | null {
  const q = input.toLowerCase()
  if (!/(prepare|prep|meeting|appointment|consult|interview|agenda)/.test(q)) return null
  if (/(attorney|lawyer|legal|guardianship consult)/.test(q)) return 'attorney'
  if (/(benefits|ssi|social security|medicaid interview)/.test(q)) return 'benefits'
  if (/(doctor|medical|pediatric|appointment|clinic)/.test(q)) return 'medical'
  if (/(iep|school|transition meeting|teacher|conference)/.test(q)) return 'iep'
  return 'iep' // "prepare me for the meeting" → the most common one on this road
}

export function buildMeetingKit(type: MeetingType, state: FamilyState): CompanionResponse {
  const kit = kits[type]
  const name = firstName(state.child.name)

  const have = kit.documents.filter((c) => state.documents.some((d) => d.categoryId === c))
  const missing = kit.documents.filter((c) => !state.documents.some((d) => d.categoryId === c))

  const docItems = [
    ...have.map((c) => `✓ ${kit.documentLabels[c]} — in your vault, ready to bring`),
    ...missing.map((c) => `◻ ${kit.documentLabels[c]} — not in your vault yet; add it or note why it’s unavailable`),
  ]

  return {
    kind: 'record',
    intro: `Here’s a preparation kit for your ${kit.title}, built from ${name}’s record — the agenda, the questions worth asking, and a document check against your actual vault.`,
    sections: [
      { heading: 'Suggested agenda', items: kit.agenda(state, name).map((a) => personalize(a, state.child.name)) },
      { heading: 'Questions worth asking', items: kit.questions(state, name) },
      { heading: 'Documents — checked against your vault', items: docItems },
      { heading: 'After the meeting', items: kit.followUps },
    ],
    points: [],
    nextSteps: missing.length > 0 ? [`Add the missing ${missing.length === 1 ? 'document' : 'documents'} to the vault before the meeting`] : ['Your document set looks complete — print or share it the day before'],
    moduleLink: { label: 'Open the Document Vault', to: '/documents' },
    professionalNote: kit.professionalNote,
  }
}
