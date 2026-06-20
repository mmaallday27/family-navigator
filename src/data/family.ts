export interface FamilyMember {
  id: string
  name: string
  role: string
  roleId: string
  contribution: string
  status: 'core' | 'active' | 'occasional'
  initials: string
  accent: string // tailwind color key
  lastTouch: string
}

export const familyMembers: FamilyMember[] = [
  {
    id: 'm1',
    name: 'Maya Carter',
    role: 'Parent · Primary coordinator',
    roleId: 'parent',
    contribution: 'Holds the big picture, schedules meetings, keeps the records.',
    status: 'core',
    initials: 'MC',
    accent: 'teal',
    lastTouch: 'Today',
  },
  {
    id: 'm2',
    name: 'James Carter',
    role: 'Parent',
    roleId: 'parent',
    contribution: 'Practices independent-living routines and weekend skills with Eli.',
    status: 'core',
    initials: 'JC',
    accent: 'teal',
    lastTouch: 'Yesterday',
  },
  {
    id: 'm3',
    name: 'Ms. Rivera',
    role: 'Special education teacher',
    roleId: 'teacher',
    contribution: 'Leads the IEP team and tracks transition goals at school.',
    status: 'active',
    initials: 'AR',
    accent: 'sage',
    lastTouch: '1 week ago',
  },
  {
    id: 'm4',
    name: 'Daniel Okafor',
    role: 'Speech & communication therapist',
    roleId: 'therapist',
    contribution: 'Supports self-advocacy and communication for adult settings.',
    status: 'active',
    initials: 'DO',
    accent: 'lav',
    lastTouch: '2 weeks ago',
  },
  {
    id: 'm5',
    name: 'Priya Shah',
    role: 'Transition coordinator',
    roleId: 'transition',
    contribution: 'Maps adult services, waitlists, and the VR application.',
    status: 'active',
    initials: 'PS',
    accent: 'amber',
    lastTouch: '4 days ago',
  },
  {
    id: 'm6',
    name: 'Robert Lin, Esq.',
    role: 'Special-needs attorney',
    roleId: 'attorney',
    contribution: 'Advising on age-18 decisions and a future special needs trust.',
    status: 'occasional',
    initials: 'RL',
    accent: 'rose',
    lastTouch: '1 month ago',
  },
  {
    id: 'm7',
    name: 'Grace Bennett',
    role: 'Parent advocate',
    roleId: 'advocate',
    contribution: 'Joins key meetings and helps Maya prepare and follow up.',
    status: 'occasional',
    initials: 'GB',
    accent: 'sage',
    lastTouch: '3 weeks ago',
  },
  {
    id: 'm8',
    name: 'Open — Adult services contact',
    role: 'Adult service agency',
    roleId: 'adult',
    contribution: 'To be added once a waiver coordinator is assigned.',
    status: 'occasional',
    initials: '+',
    accent: 'teal',
    lastTouch: 'Not yet connected',
  },
]

export const familyActivity = [
  { id: 'a1', who: 'Priya Shah', what: 'shared a VR application checklist', when: '4 days ago', accent: 'amber' },
  { id: 'a2', who: 'Ms. Rivera', what: 'scheduled the fall IEP meeting for Sep 18', when: '1 week ago', accent: 'sage' },
  { id: 'a3', who: 'Maya Carter', what: 'added “decide guardianship approach” as a goal', when: '1 week ago', accent: 'teal' },
  { id: 'a4', who: 'Robert Lin, Esq.', what: 'sent notes on supported decision-making', when: '1 month ago', accent: 'rose' },
]
