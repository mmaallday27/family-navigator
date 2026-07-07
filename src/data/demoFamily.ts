// The Carter family — sample data used when someone chooses "explore with a
// sample family" during onboarding. Everything here is illustrative.

import type { ChildProfile, ParentProfile, Goal } from '../store/FamilyContext'
import { demoDocFiles } from './documents'

export const demoChild: ChildProfile = {
  name: 'Eli Carter',
  pronouns: 'he/him',
  birthDate: '2009-03-04',
  diagnosis: 'Autism Spectrum (Level 1) · ADHD',
  diagnosedAt: 'Age 4',
  strengths: ['Visual thinking', 'Pattern & systems', 'Honesty', 'Deep focus on interests'],
  interests: ['Trains & transit maps', 'Animation', 'Cooking'],
  communication: 'Verbal · prefers written instructions and extra processing time',
  schoolGrade: '11th grade',
}

export const demoParent: ParentProfile = {
  name: 'Maya Carter',
  relationship: 'Mother',
}

// Checklist items the demo family has already completed (keys into
// transitionTracks checklists — see data/transition.ts).
export const demoChecks: Record<string, boolean> = {
  c14a: true,
  c14b: true,
}

export const demoSavedResources = ['r2']

export const demoGoals: Goal[] = [
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

export { demoDocFiles as demoDocuments }

// Extra demo-only moments shown alongside the derived legal milestones.
export const demoDeadlines = [
  {
    id: 'd1',
    title: 'Annual IEP meeting — transition focus',
    dateLabel: 'Sep 18, 2026',
    sort: new Date('2026-09-18').getTime(),
    category: 'School',
    urgent: false,
  },
  {
    id: 'd2',
    title: 'Apply for state Vocational Rehabilitation (VR)',
    dateLabel: 'Open now — apply before senior year',
    sort: 0, // always first
    category: 'Adult services',
    urgent: true,
  },
  {
    id: 'd4',
    title: 'Vocational interest assessment scheduled',
    dateLabel: 'Oct 7, 2026',
    sort: new Date('2026-10-07').getTime(),
    category: 'Employment',
    urgent: false,
  },
]
