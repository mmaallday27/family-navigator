// The full six-stage Development Lifecycle model.
// Transition is flagged active for the demo, but every stage is fully fleshed out
// so families can "see the whole road" from day one.

export interface JourneyStage {
  id: string
  index: number
  ageRange: string
  title: string
  tagline: string
  concerns: string[]
  milestones: string[]
  documents: string[]
  questions: string[]
  nextSteps: string[]
  status: 'complete' | 'active' | 'upcoming'
}

export const journeyStages: JourneyStage[] = [
  {
    id: 'recognition',
    index: 1,
    ageRange: 'Birth – ~4',
    title: 'Recognition & Diagnosis',
    tagline: 'Understanding what’s happening and where to start.',
    status: 'complete',
    concerns: [
      'Is my child developing differently?',
      'Who do we talk to first?',
      'How long do evaluations take?',
      'What does a diagnosis actually mean?',
    ],
    milestones: [
      'Share concerns with pediatrician',
      'Developmental screening',
      'Comprehensive evaluation',
      'Receiving and understanding the diagnosis',
    ],
    documents: [
      'Pediatric developmental screening',
      'Diagnostic evaluation report',
      'Early Intervention referral',
    ],
    questions: [
      'What evaluations are needed?',
      'Where do we start?',
      'Who can explain the results to us?',
    ],
    nextSteps: [
      'Request a developmental evaluation',
      'Connect with Early Intervention',
      'Start a simple record-keeping system',
    ],
  },
  {
    id: 'early',
    index: 2,
    ageRange: '~3 – 6',
    title: 'Early Foundation',
    tagline: 'Building skills, routines, and the first support team.',
    status: 'complete',
    concerns: [
      'Which therapies actually help?',
      'How do we build communication?',
      'How do we set up daily routines?',
      'Are we doing enough?',
    ],
    milestones: [
      'Begin speech therapy',
      'Begin occupational therapy',
      'Establish behavior supports',
      'Create predictable home routines',
    ],
    documents: [
      'Therapy evaluations & plans',
      'IFSP (Individualized Family Service Plan)',
      'Progress notes',
    ],
    questions: [
      'What therapies fit my child?',
      'How do we build communication skills?',
      'How do we keep routines consistent?',
    ],
    nextSteps: [
      'Coordinate a consistent therapy schedule',
      'Build visual routines at home',
      'Prepare for the transition to school services',
    ],
  },
  {
    id: 'school',
    index: 3,
    ageRange: '5 – 13',
    title: 'School Years',
    tagline: 'Advocacy, accommodations, and steady growth.',
    status: 'complete',
    concerns: [
      'Is the IEP strong enough?',
      'Are accommodations being followed?',
      'How is social development going?',
      'How do I advocate effectively?',
    ],
    milestones: [
      'First IEP in place',
      'Accommodations implemented',
      'Annual IEP reviews',
      'Social & friendship supports',
    ],
    documents: [
      'IEP & amendments',
      'Accommodation (504) plans',
      'Progress reports & report cards',
      'Re-evaluations',
    ],
    questions: [
      'What accommodations should we request?',
      'How do I prepare for an IEP meeting?',
      'How is my child progressing socially?',
    ],
    nextSteps: [
      'Track IEP goals each term',
      'Build a partnership with the teaching team',
      'Begin noticing strengths that point toward the future',
    ],
  },
  {
    id: 'transition',
    index: 4,
    ageRange: '14 – 22',
    title: 'Transition to Adulthood',
    tagline: 'The most underserved stretch of the road — and your current focus.',
    status: 'active',
    concerns: [
      'What happens when school services end?',
      'Should we pursue guardianship?',
      'Will benefits change at 18?',
      'What does adult life look like?',
    ],
    milestones: [
      'Age 14 — transition plan added to IEP',
      'Vocational & interest assessments',
      'Age 18 — legal & benefits decisions',
      'Age 21/22 — move to adult services',
    ],
    documents: [
      'Transition plan (in the IEP)',
      'Vocational assessments',
      'Guardianship / supported decision-making paperwork',
      'Benefits applications (SSI, Medicaid waiver)',
    ],
    questions: [
      'What should I be thinking about now?',
      'What do I bring to a transition meeting?',
      'Which adult services should we research?',
      'How do we prepare for employment?',
    ],
    nextSteps: [
      'Add measurable transition goals to the IEP',
      'Decide on a decision-making approach by 18',
      'Apply to Vocational Rehabilitation',
      'Get on adult-service waiver waitlists early',
    ],
  },
  {
    id: 'adult',
    index: 5,
    ageRange: '22+',
    title: 'Adult Life',
    tagline: 'Employment, community, housing, and belonging.',
    status: 'upcoming',
    concerns: [
      'How do we find the right job fit?',
      'What housing options exist?',
      'How do we build a community?',
      'How do supports continue?',
    ],
    milestones: [
      'Stable employment or day program',
      'Community participation',
      'Housing arrangement',
      'Ongoing support system',
    ],
    documents: [
      'Employment supports agreement',
      'Adult service plans (ISP)',
      'Housing & lease documents',
      'Benefits renewals',
    ],
    questions: [
      'What employment supports exist?',
      'What housing models fit my child?',
      'How do we sustain relationships and community?',
    ],
    nextSteps: [
      'Explore supported & customized employment',
      'Tour housing models early',
      'Build a circle of community connections',
    ],
  },
  {
    id: 'legacy',
    index: 6,
    ageRange: 'Lifelong',
    title: 'Future Planning & Legacy',
    tagline: 'Continuity and security for the long road ahead.',
    status: 'upcoming',
    concerns: [
      'What happens when we’re no longer here?',
      'How do we protect benefits and assets?',
      'Who continues the coordination?',
      'How do we document everything?',
    ],
    milestones: [
      'Special needs trust established',
      'Letter of intent written',
      'Successor decision-makers named',
      'Continuity plan documented',
    ],
    documents: [
      'Special needs trust',
      'Will & estate documents',
      'Letter of intent',
      'ABLE account records',
    ],
    questions: [
      'How do we protect benefits while saving?',
      'Who will coordinate care in the future?',
      'How do we write a letter of intent?',
    ],
    nextSteps: [
      'Consult a special-needs planning attorney',
      'Open an ABLE account',
      'Draft a letter of intent',
    ],
  },
]
