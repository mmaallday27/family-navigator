// Demo family data. Everything here is illustrative mock content for the prototype.

export const child = {
  name: 'Eli Carter',
  pronouns: 'he/him',
  age: 17,
  birthday: 'March 4, 2009',
  diagnosis: 'Autism Spectrum (Level 1) · ADHD',
  diagnosedAt: 'Age 4',
  strengths: ['Visual thinking', 'Pattern & systems', 'Honesty', 'Deep focus on interests'],
  interests: ['Trains & transit maps', 'Animation', 'Cooking'],
  communication: 'Verbal · prefers written instructions and extra processing time',
  currentStageId: 'transition',
  currentStageLabel: 'Transition to Adulthood',
  schoolGrade: '11th grade',
}

export const parent = {
  name: 'Maya Carter',
  role: 'Parent / Primary coordinator',
  relationship: 'Mother',
}

// Progress across the six lifecycle stages, 0–100. Used by the dashboard + journey map.
export const stageProgress: Record<string, number> = {
  recognition: 100,
  early: 100,
  school: 88,
  transition: 42,
  adult: 8,
  legacy: 15,
}

export const activeGoals = [
  {
    id: 'g1',
    title: 'Add transition goals to the IEP',
    area: 'Transition planning',
    due: 'Aug 2026',
    progress: 60,
    owner: 'Maya + School team',
  },
  {
    id: 'g2',
    title: 'Decide guardianship vs. supported decision-making',
    area: 'Age 18 planning',
    due: 'Before Mar 2027',
    progress: 25,
    owner: 'Maya + Attorney',
  },
  {
    id: 'g3',
    title: 'Complete a vocational interest assessment',
    area: 'Employment readiness',
    due: 'Oct 2026',
    progress: 40,
    owner: 'Transition coordinator',
  },
  {
    id: 'g4',
    title: 'Build a weekly independent-living skills routine',
    area: 'Independent living',
    due: 'Ongoing',
    progress: 55,
    owner: 'Maya + Eli',
  },
]

export const upcomingDeadlines = [
  {
    id: 'd1',
    title: 'Annual IEP meeting — transition focus',
    date: 'Sep 18, 2026',
    daysAway: 90,
    category: 'School',
    urgent: false,
  },
  {
    id: 'd2',
    title: 'Apply for state Vocational Rehabilitation (VR)',
    date: 'Open now — apply before senior year',
    daysAway: 30,
    category: 'Adult services',
    urgent: true,
  },
  {
    id: 'd3',
    title: 'Eli turns 18 — legal decisions take effect',
    date: 'Mar 4, 2027',
    daysAway: 257,
    category: 'Legal',
    urgent: false,
  },
  {
    id: 'd4',
    title: 'Vocational interest assessment scheduled',
    date: 'Oct 7, 2026',
    daysAway: 109,
    category: 'Employment',
    urgent: false,
  },
]

// Surfaced on the dashboard as the "do this next" guidance.
export const recommendedActions = [
  {
    id: 'a1',
    title: 'Start the SSI benefits research now',
    why: 'SSI is reviewed at age 18 using adult rules. Understanding it early avoids a gap in support.',
    module: 'Transition Navigator',
    to: '/transition',
    minutes: 15,
  },
  {
    id: 'a2',
    title: 'Prepare questions for the fall IEP meeting',
    why: 'A focused transition agenda makes the annual meeting far more productive.',
    module: 'AI Companion',
    to: '/companion',
    minutes: 10,
  },
  {
    id: 'a3',
    title: 'Upload Eli’s most recent evaluation',
    why: 'Adult services and VR will ask for current documentation. Keep it ready in one place.',
    module: 'Document Vault',
    to: '/documents',
    minutes: 5,
  },
]
