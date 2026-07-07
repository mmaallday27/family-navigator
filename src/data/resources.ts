export interface Resource {
  id: string
  name: string
  type: string
  typeId: string
  description: string
  serves: string
  contact: string
  free: boolean
  tags: string[]
  /** Lifecycle stages this resource is most relevant to — used for matching. */
  stages: string[]
  /** Onboarding concern ids this resource speaks to — used for matching. */
  concernIds: string[]
  /** Recently added to the directory — surfaced as "new" in briefings. */
  addedRecently?: boolean
}

export const resourceTypes = [
  { id: 'all', label: 'All resources' },
  { id: 'support', label: 'Support organizations' },
  { id: 'transition', label: 'Transition coordinators' },
  { id: 'legal', label: 'Attorneys' },
  { id: 'vocational', label: 'Vocational programs' },
  { id: 'adult', label: 'Adult service agencies' },
  { id: 'parent', label: 'Parent support groups' },
]

export const resources: Resource[] = [
  {
    id: 'r1',
    name: 'State Parent Training & Information Center',
    type: 'Support organization',
    typeId: 'support',
    description: 'Free guidance on IEPs, transition rights, and navigating the system. A great first call.',
    serves: 'All ages · statewide',
    contact: 'Free helpline · workshops',
    free: true,
    tags: ['IEP', 'Rights', 'Free'],
    stages: ['recognition', 'early', 'school', 'transition'],
    concernIds: ['iep', 'overwhelmed'],
  },
  {
    id: 'r2',
    name: 'County Transition Coordination Program',
    type: 'Transition coordinator',
    typeId: 'transition',
    description: 'Helps families map adult services, waitlists, and the move out of school services.',
    serves: 'Ages 14–22',
    contact: 'Referral via school or self-refer',
    free: true,
    tags: ['Transition', 'Adult services', 'Free'],
    stages: ['transition'],
    concernIds: ['after-school', 'legal-18'],
  },
  {
    id: 'r3',
    name: 'Vocational Rehabilitation (State VR)',
    type: 'Vocational program',
    typeId: 'vocational',
    description: 'Job assessment, training, coaching, and supported employment for eligible young adults.',
    serves: 'Typically 16+',
    contact: 'Apply online · in-person intake',
    free: true,
    tags: ['Employment', 'Pre-ETS', 'Free'],
    stages: ['transition', 'adult'],
    concernIds: ['employment', 'after-school'],
  },
  {
    id: 'r4',
    name: 'Bridgeway Special-Needs Law Group',
    type: 'Attorney',
    typeId: 'legal',
    description: 'Guardianship alternatives, supported decision-making, special needs trusts, and estate planning.',
    serves: 'Families planning age-18 & future care',
    contact: 'Consultation (fees vary)',
    free: false,
    tags: ['Guardianship', 'Trusts', 'Legal'],
    stages: ['transition', 'adult', 'legacy'],
    concernIds: ['legal-18', 'housing'],
  },
  {
    id: 'r5',
    name: 'Regional Adult Services Agency',
    type: 'Adult service agency',
    typeId: 'adult',
    description: 'Day programs, community supports, and Medicaid waiver service coordination.',
    serves: 'Ages 18+',
    contact: 'Waitlist intake — apply early',
    free: true,
    tags: ['Waiver', 'Day programs', 'Adult'],
    stages: ['transition', 'adult'],
    concernIds: ['after-school', 'housing', 'benefits'],
  },
  {
    id: 'r6',
    name: 'Stepping Stones Supported Employment',
    type: 'Vocational program',
    typeId: 'vocational',
    description: 'Customized job matching and on-the-job coaching with local employer partners.',
    serves: 'Ages 18+',
    contact: 'Referral · often VR-funded',
    free: true,
    tags: ['Employment', 'Job coaching'],
    stages: ['transition', 'adult'],
    concernIds: ['employment'],
    addedRecently: true,
  },
  {
    id: 'r7',
    name: 'Carter County Parent Network',
    type: 'Parent support group',
    typeId: 'parent',
    description: 'Monthly meetups and a moderated group where parents share what actually worked.',
    serves: 'All ages · local',
    contact: 'Free · monthly meetings',
    free: true,
    tags: ['Community', 'Peer support', 'Free'],
    stages: ['recognition', 'early', 'school', 'transition', 'adult'],
    concernIds: ['overwhelmed'],
  },
  {
    id: 'r8',
    name: 'Independent Living Skills Center',
    type: 'Adult service agency',
    typeId: 'adult',
    description: 'Classes in cooking, transit, budgeting, and apartment readiness for young adults.',
    serves: 'Ages 16+',
    contact: 'Enroll by term',
    free: false,
    tags: ['Independent living', 'Skills'],
    stages: ['transition', 'adult'],
    concernIds: ['independence', 'housing'],
  },
  {
    id: 'r9',
    name: 'ABLE Account Program',
    type: 'Support organization',
    typeId: 'support',
    description: 'Tax-advantaged savings that don’t jeopardize SSI/Medicaid eligibility.',
    serves: 'Onset of disability before 26',
    contact: 'Open account online',
    free: true,
    tags: ['Benefits', 'Savings', 'ABLE'],
    stages: ['transition', 'adult', 'legacy'],
    concernIds: ['benefits'],
    addedRecently: true,
  },
]
