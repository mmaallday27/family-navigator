// Mock AI Companion knowledge. Responses are educational and organizational only —
// never diagnostic, medical, or legal advice. Each canned answer carries that posture.

export interface CompanionAnswer {
  match: string[] // keywords that route to this answer
  prompt: string // the suggested-prompt label
  category: string
  response: {
    intro: string
    points: { title: string; body: string }[]
    nextSteps?: string[]
    moduleLink?: { label: string; to: string }
  }
}

export const suggestedPrompts: CompanionAnswer[] = [
  {
    prompt: 'My child is turning 18. What should I be thinking about?',
    category: 'Age 18 planning',
    match: ['18', 'eighteen', 'turning'],
    response: {
      intro:
        'Turning 18 is a meaningful milestone. Here are the areas most families find worth understanding early — so the birthday feels prepared-for, not surprising.',
      points: [
        {
          title: 'Decision-making approach',
          body: 'At 18 your child is a legal adult. Families weigh options from supported decision-making to powers of attorney to guardianship. This is a conversation to have with an attorney — I can help you organize the questions, but I don’t give legal advice.',
        },
        {
          title: 'Benefits review',
          body: 'SSI is re-evaluated using adult rules at 18, and Medicaid pathways may shift. Researching this a couple of years ahead helps avoid a gap.',
        },
        {
          title: 'Healthcare & information access',
          body: 'Decide how medical decisions and records access will work once your child is an adult.',
        },
      ],
      nextSteps: [
        'Open the Age 18 track in the Transition Navigator',
        'Add “choose a decision-making approach” as a goal',
        'Book a consult with a special-needs attorney',
      ],
      moduleLink: { label: 'Go to Age 18 planning', to: '/transition' },
    },
  },
  {
    prompt: 'What should I bring to a transition meeting?',
    category: 'Meetings',
    match: ['bring', 'transition meeting', 'iep meeting', 'meeting'],
    response: {
      intro:
        'Walking in organized changes the whole tone of a transition meeting. Here’s a simple kit that works well.',
      points: [
        {
          title: 'Your child’s vision',
          body: 'A few sentences on what a good adult life could look like — work, where they live, what they enjoy. This anchors the whole conversation.',
        },
        {
          title: 'Current documents',
          body: 'Most recent IEP, any evaluations, and progress notes. Your Document Vault keeps these in one place.',
        },
        {
          title: 'Your questions',
          body: 'Write them down beforehand. Examples: “What measurable transition goals will we add?” and “Who connects us to adult services?”',
        },
        {
          title: 'A note-taker plan',
          body: 'Bring someone, or ask to record, so you can be present instead of scrambling to write.',
        },
      ],
      nextSteps: [
        'Pull your latest IEP from the Document Vault',
        'Draft 3 questions to bring',
        'Invite your advocate from Family Circle',
      ],
      moduleLink: { label: 'Open the Document Vault', to: '/documents' },
    },
  },
  {
    prompt: 'What adult services should I research now?',
    category: 'Adult services',
    match: ['adult services', 'services', 'research', 'waiver'],
    response: {
      intro:
        'Adult services aren’t automatic — they’re applied for, often with long waitlists. Getting on lists early is one of the highest-value things you can do.',
      points: [
        {
          title: 'Vocational Rehabilitation (VR)',
          body: 'Job assessment, training, and supported employment for eligible young adults. Worth applying before the final school year.',
        },
        {
          title: 'Medicaid waivers',
          body: 'Waivers can fund community supports, day programs, and employment supports. Waitlists can be long — apply as early as allowed.',
        },
        {
          title: 'Day & community programs',
          body: 'Explore what’s available locally and tour early, so you can picture the day-to-day.',
        },
      ],
      nextSteps: [
        'Open the Age 21/22 track for the “services cliff” plan',
        'Find your regional adult-services agency in the Resource Navigator',
        'Get on waiver waitlists now',
      ],
      moduleLink: { label: 'Browse the Resource Navigator', to: '/resources' },
    },
  },
  {
    prompt: 'What questions should I ask about employment programs?',
    category: 'Employment',
    match: ['employment', 'job', 'work', 'vocational'],
    response: {
      intro:
        'Good employment questions get past brochures and into fit. Here are ones that tend to reveal the most.',
      points: [
        {
          title: 'About the match',
          body: '“How do you match someone to a job based on their strengths and interests?” Fit matters more than placement speed.',
        },
        {
          title: 'About support',
          body: '“What on-the-job coaching is included, and for how long?” and “What happens if the first job isn’t the right one?”',
        },
        {
          title: 'About outcomes',
          body: '“What do typical hours, wages, and employer partnerships look like?”',
        },
      ],
      nextSteps: [
        'Note Eli’s strengths & interests to share with programs',
        'Compare two vocational programs in the Resource Navigator',
        'Ask the transition coordinator who they recommend',
      ],
      moduleLink: { label: 'See vocational programs', to: '/resources' },
    },
  },
]

// Fallback for free-typed prompts that don't match a keyword.
export const fallbackAnswer: CompanionAnswer['response'] = {
  intro:
    'I can help you understand, organize, and prepare for what’s ahead — especially around the transition to adulthood. I don’t diagnose or give medical or legal advice; for those, I’ll help you get ready to talk with the right professional.',
  points: [
    {
      title: 'Try one of these',
      body: 'Ask about turning 18, what to bring to a transition meeting, which adult services to research, or how to prepare for employment programs.',
    },
    {
      title: 'Or tell me where you are',
      body: 'Share your child’s age or what’s worrying you most, and I’ll point you to the right part of the journey.',
    },
  ],
  nextSteps: ['Explore the Transition Navigator', 'Review your upcoming deadlines on the dashboard'],
  moduleLink: { label: 'Open the Transition Navigator', to: '/transition' },
}
