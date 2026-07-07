// Deepest module of the platform: the Transition to Adulthood wedge.
// Three age-anchored tracks, each with guidance + practical checklists.
// Checklist labels may include a {name} token, personalized at render time.
// Completion state lives in the family store — this file is pure content.

export interface ChecklistItem {
  id: string
  label: string
  detail?: string
  /** Why this matters — surfaced by the next-step engine on the dashboard. */
  why?: string
  /** Rough time investment, in minutes, for the "small next step" framing. */
  minutes?: number
}

export interface TransitionTrack {
  id: string
  age: string
  /** The age this track anchors to — used to pick the family's current focus. */
  anchorAge: number
  title: string
  summary: string
  focus: string[]
  guidance: { heading: string; body: string }[]
  checklist: ChecklistItem[]
  tip: string
}

export const transitionTracks: TransitionTrack[] = [
  {
    id: 'age14',
    age: 'Age 14',
    anchorAge: 14,
    title: 'Begin the Transition Plan',
    summary:
      'Transition planning becomes part of the IEP. This is the moment to start aiming the whole team at adult life — gently and early.',
    focus: ['Transition goals', 'Life skills', 'Self-advocacy', 'Future vision'],
    guidance: [
      {
        heading: 'Make the IEP transition-focused',
        body: 'By law, transition planning is added to the IEP around this age. Push for measurable goals in three areas: education/training, employment, and independent living.',
      },
      {
        heading: 'Start building life skills now',
        body: 'Cooking, money handling, time management, and self-care are best taught over years, not months. Small weekly routines compound powerfully.',
      },
      {
        heading: 'Grow self-advocacy',
        body: 'Invite your child to part of the IEP meeting. Practicing “what helps me / what I need” is a skill that pays off for the rest of their life.',
      },
    ],
    checklist: [
      {
        id: 'c14a',
        label: 'Confirm transition goals are written into the IEP',
        detail: 'Education, employment, and independent living.',
        why: 'Measurable IEP transition goals are the legal backbone of everything that follows.',
        minutes: 15,
      },
      {
        id: 'c14b',
        label: 'Start a weekly life-skills routine at home',
        detail: 'Pick one skill: cooking, laundry, or money.',
        why: 'Independent-living skills compound — one small weekly routine now beats a scramble at 21.',
        minutes: 10,
      },
      {
        id: 'c14c',
        label: 'Have {name} attend part of the next IEP meeting',
        why: 'Self-advocacy grows from practice. Even ten minutes in the room builds the habit.',
        minutes: 10,
      },
      {
        id: 'c14d',
        label: 'Begin a “strengths & interests” list to guide planning',
        why: 'The best transition plans are built around what your child is great at, not just needs.',
        minutes: 10,
      },
      {
        id: 'c14e',
        label: 'Ask the school about vocational / interest assessments',
        why: 'Assessments turn “what might work” into concrete direction for employment planning.',
        minutes: 5,
      },
    ],
    tip: 'You don’t need every answer at 14. You just need the team pointed in the right direction.',
  },
  {
    id: 'age18',
    age: 'Age 18',
    anchorAge: 18,
    title: 'Legal & Benefits Decisions',
    summary:
      'At 18 your child becomes a legal adult. A few important decisions are best understood — and prepared for — well before the birthday.',
    focus: ['Decision-making', 'Benefits', 'Adult identity', 'Healthcare'],
    guidance: [
      {
        heading: 'Choose a decision-making approach',
        body: 'Options range from full guardianship to supported decision-making and powers of attorney. Many families now prefer the least-restrictive option that keeps the young adult safe. This is a decision to discuss with an attorney — not legal advice.',
      },
      {
        heading: 'Understand the benefits shift',
        body: 'SSI eligibility is re-evaluated using adult rules at 18, and Medicaid pathways may change. Researching early prevents a gap in support during a stressful season.',
      },
      {
        heading: 'Healthcare & consent',
        body: 'Decide how medical decisions and information access will work once your child is an adult (e.g., HIPAA authorization, healthcare proxy).',
      },
    ],
    checklist: [
      {
        id: 'c18a',
        label: 'Compare guardianship vs. supported decision-making',
        detail: 'Discuss with a special-needs attorney.',
        why: 'The decision-making approach must be in place by the 18th birthday — courts and paperwork take months.',
        minutes: 20,
      },
      {
        id: 'c18b',
        label: 'Research SSI under adult rules',
        detail: 'Eligibility changes the month after the 18th birthday.',
        why: 'SSI is reviewed with adult rules at 18. Understanding it early avoids a gap in support.',
        minutes: 15,
      },
      {
        id: 'c18c',
        label: 'Check Medicaid / waiver continuation',
        why: 'Medicaid pathways can shift at 18 — confirming continuity protects services and therapies.',
        minutes: 10,
      },
      {
        id: 'c18d',
        label: 'Set up healthcare consent / HIPAA authorization',
        why: 'Without consent paperwork, you may lose access to medical information the day {name} turns 18.',
        minutes: 10,
      },
      {
        id: 'c18e',
        label: 'Register to vote / state ID (adult identity steps)',
        why: 'Adult identity documents unlock everything from benefits applications to travel.',
        minutes: 10,
      },
    ],
    tip: 'Start the age-18 conversation around 16. The paperwork and waitlists take longer than anyone expects.',
  },
  {
    id: 'age21',
    age: 'Age 21 / 22',
    anchorAge: 21,
    title: 'School Services End — Adult Services Begin',
    summary:
      'Public school entitlement ends (often at 21 or 22). Adult services are not automatic — they must be applied for, sometimes years ahead.',
    focus: ['Adult services', 'Employment', 'Day-to-day supports', 'Independence'],
    guidance: [
      {
        heading: 'The “services cliff” is real — plan for it',
        body: 'School services are an entitlement; adult services are not. Get on waiver and agency waitlists as early as allowed, because they can be long.',
      },
      {
        heading: 'Line up employment supports',
        body: 'Vocational Rehabilitation (VR), supported employment, and customized employment can help with job matching, coaching, and on-the-job support.',
      },
      {
        heading: 'Confirm the daily plan',
        body: 'Make sure there is a concrete plan for the first weekday after school ends — employment, post-secondary program, or day services — so momentum isn’t lost.',
      },
    ],
    checklist: [
      {
        id: 'c21a',
        label: 'Apply to Vocational Rehabilitation (VR)',
        detail: 'Best done before the final school year.',
        why: 'VR applications take time to process — applying before senior year keeps employment support seamless.',
        minutes: 20,
      },
      {
        id: 'c21b',
        label: 'Get on adult-service / Medicaid waiver waitlists',
        why: 'Waiver waitlists can run years long. Every month earlier on the list matters.',
        minutes: 15,
      },
      {
        id: 'c21c',
        label: 'Identify a day-one plan for after school ends',
        why: 'The “first Monday after school ends” needs a concrete answer so momentum isn’t lost.',
        minutes: 15,
      },
      {
        id: 'c21d',
        label: 'Explore supported & customized employment options',
        why: 'Job fit built around strengths beats placement speed — exploring early gives you choices.',
        minutes: 15,
      },
      {
        id: 'c21e',
        label: 'Build an independent-living skills checklist',
        why: 'A concrete skills list turns “independence someday” into a teachable weekly plan.',
        minutes: 10,
      },
    ],
    tip: 'Ask one question early: “What is the plan for the first Monday after school ends?” Build backward from there.',
  },
]

/** All checklist items across every track, keyed for quick lookups. */
export const allChecklistItems = transitionTracks.flatMap((t) =>
  t.checklist.map((item) => ({ ...item, trackId: t.id })),
)
