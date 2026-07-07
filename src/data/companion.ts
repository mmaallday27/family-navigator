// Companion knowledge. Responses are educational and organizational only —
// never diagnostic, medical, or legal advice; each answer carries that posture.
// Strings may include {name} tokens, personalized at render time. The live
// "where are we / what's next" answer is built from real store state in the
// Companion page — this file holds the static knowledge base.

export interface CompanionResponse {
  intro: string
  points: { title: string; body: string }[]
  /** Grouped bullet lists — used by meeting kits, scenarios, and comparisons. */
  sections?: { heading: string; items: string[] }[]
  nextSteps?: string[]
  moduleLink?: { label: string; to: string }
  /**
   * Trust layer: 'record' answers are computed from this family's actual data;
   * 'educational' answers are general guidance. Rendered as a visible badge.
   */
  kind?: 'record' | 'educational'
  /** When the topic needs a licensed professional, say so explicitly. */
  professionalNote?: string
}

export interface CompanionAnswer {
  match: string[] // keywords that route to this answer
  prompt: string // the suggested-prompt label
  category: string
  /** Which lifecycle stages this prompt is most relevant to (for suggestions). */
  stages: string[]
  response: CompanionResponse
}

export const companionKnowledge: CompanionAnswer[] = [
  {
    prompt: 'My child is turning 18. What should I be thinking about?',
    category: 'Age 18 planning',
    stages: ['transition'],
    match: ['18', 'eighteen', 'turning'],
    response: {
      intro:
        'Turning 18 is a meaningful milestone. Here are the areas most families find worth understanding early — so the birthday feels prepared-for, not surprising.',
      points: [
        {
          title: 'Decision-making approach',
          body: 'At 18, {name} becomes a legal adult. Families weigh options from supported decision-making to powers of attorney to guardianship. This is a conversation to have with an attorney — I can help you organize the questions, but I don’t give legal advice.',
        },
        {
          title: 'Benefits review',
          body: 'SSI is re-evaluated using adult rules at 18, and Medicaid pathways may shift. Researching this a couple of years ahead helps avoid a gap.',
        },
        {
          title: 'Healthcare & information access',
          body: 'Decide how medical decisions and records access will work once {name} is an adult.',
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
    stages: ['school', 'transition'],
    match: ['bring', 'transition meeting', 'iep meeting', 'meeting'],
    response: {
      intro:
        'Walking in organized changes the whole tone of a transition meeting. Here’s a simple kit that works well.',
      points: [
        {
          title: '{name}’s vision',
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
    stages: ['transition', 'adult'],
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
    stages: ['transition', 'adult'],
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
        'Note {name}’s strengths & interests to share with programs',
        'Compare two vocational programs in the Resource Navigator',
        'Ask the transition coordinator who they recommend',
      ],
      moduleLink: { label: 'See vocational programs', to: '/resources' },
    },
  },
  {
    prompt: 'We just received a diagnosis. Where do we start?',
    category: 'Getting started',
    stages: ['recognition', 'early'],
    match: ['diagnos', 'just found out', 'evaluation', 'where do we start', 'new to this'],
    response: {
      intro:
        'Take a breath — you don’t have to figure everything out this week. A diagnosis is a map key, not a verdict. Here’s a calm starting order.',
      points: [
        {
          title: 'Understand the report',
          body: 'Ask the evaluator to walk you through the findings in plain language, including strengths — not just needs. It’s okay to ask twice.',
        },
        {
          title: 'Connect with Early Intervention or the school',
          body: 'Under 3, Early Intervention is the door; 3 and up, the school district evaluates for services. Both are free to access.',
        },
        {
          title: 'Start one simple record',
          body: 'Keep every report and letter in one place from day one. The Document Vault exists exactly for this.',
        },
      ],
      nextSteps: [
        'Upload the diagnostic report to the Document Vault',
        'See the Recognition & Diagnosis stage on the Journey Map',
        'Find your Parent Training & Information Center in Resources',
      ],
      moduleLink: { label: 'See the road ahead on the Journey Map', to: '/journey' },
    },
  },
  {
    prompt: 'How do I prepare for an IEP meeting?',
    category: 'School',
    stages: ['school', 'early'],
    match: ['iep', '504', 'accommodation', 'school meeting'],
    response: {
      intro:
        'An IEP meeting goes best when you arrive as a prepared partner. A little structure beforehand changes everything.',
      points: [
        {
          title: 'Review the current plan first',
          body: 'Re-read the latest IEP and progress reports. Note what’s working, what isn’t, and what’s missing.',
        },
        {
          title: 'Bring {name}’s story',
          body: 'Teachers see school; you see everything else. Short, concrete examples from home are powerful evidence.',
        },
        {
          title: 'Ask for measurable goals',
          body: '“Improve social skills” isn’t measurable. “Initiate a peer interaction once per day with one prompt” is.',
        },
      ],
      nextSteps: [
        'Pull the current IEP from the Document Vault',
        'Write 3 wins and 3 concerns to share',
        'Invite a second set of ears from your Family Circle',
      ],
      moduleLink: { label: 'Open the Document Vault', to: '/documents' },
    },
  },
  {
    prompt: 'What housing options exist for adults?',
    category: 'Housing',
    stages: ['transition', 'adult', 'legacy'],
    match: ['housing', 'live', 'apartment', 'group home', 'residential'],
    response: {
      intro:
        'Housing is a spectrum, not a single choice — and most families explore it earlier than they expect to. The main models:',
      points: [
        {
          title: 'Living with family, with supports',
          body: 'The most common arrangement. In-home supports and respite services can make it sustainable.',
        },
        {
          title: 'Supported independent living',
          body: 'An apartment with drop-in or scheduled support — often funded through Medicaid waivers.',
        },
        {
          title: 'Shared & community models',
          body: 'Group homes, host families, and intentional communities vary widely — touring early builds real intuition.',
        },
      ],
      nextSteps: [
        'Tour one housing model this year, even casually',
        'Ask about waiver-funded residential supports',
        'Note what {name} needs to feel at home — routines, space, sensory',
      ],
      moduleLink: { label: 'Find adult service agencies', to: '/resources' },
    },
  },
  {
    prompt: 'How do we plan for the long-term future?',
    category: 'Future planning',
    stages: ['transition', 'adult', 'legacy'],
    match: ['trust', 'able account', 'estate', 'future planning', 'when we', 'legacy', 'letter of intent'],
    response: {
      intro:
        'Future planning is an act of love, not fear. A few well-known tools protect both benefits and continuity — each is a conversation with a professional, organized here.',
      points: [
        {
          title: 'Special needs trust',
          body: 'Lets family save and leave assets without jeopardizing SSI/Medicaid eligibility. Set up with a special-needs planning attorney.',
        },
        {
          title: 'ABLE account',
          body: 'A tax-advantaged savings account (disability onset before 26) that doesn’t count against benefit limits.',
        },
        {
          title: 'Letter of intent',
          body: 'Not a legal document — a living guide to {name}’s routines, preferences, people, and history for future caregivers. Your record here is the raw material.',
        },
      ],
      nextSteps: [
        'Consult a special-needs planning attorney',
        'Open an ABLE account',
        'Start a letter of intent — one paragraph is a fine beginning',
      ],
      moduleLink: { label: 'See the Future Planning stage', to: '/journey' },
    },
  },
  {
    prompt: 'I’m feeling overwhelmed by all of this.',
    category: 'You matter too',
    stages: ['recognition', 'early', 'school', 'transition', 'adult', 'legacy'],
    match: ['overwhelm', 'alone', 'tired', 'exhausted', 'scared', 'too much', 'burnout', 'stress'],
    response: {
      intro:
        'That feeling is real, and it makes sense — you’ve been asked to be a coordinator, advocate, and expert on top of being a parent. You don’t have to hold all of it at once.',
      points: [
        {
          title: 'The road is already mapped',
          body: 'You don’t need to see every mile today. The Journey Map holds the whole picture so your head doesn’t have to.',
        },
        {
          title: 'One small step counts',
          body: 'Your next steps on the home page are sized in minutes, not weekends. One is enough for today.',
        },
        {
          title: 'Other parents get it',
          body: 'Parent support groups are where the practical wisdom lives — and where “me too” does more than any checklist.',
        },
      ],
      nextSteps: [
        'Do just one 5-minute step from your home page',
        'Find a parent support group in the Resource Navigator',
        'Close the laptop after — the plan will keep',
      ],
      moduleLink: { label: 'Find parent support', to: '/resources' },
    },
  },
]

// Fallback for free-typed prompts that don't match a keyword.
export const fallbackAnswer: CompanionResponse = {
  intro:
    'I can help you understand, organize, and prepare for what’s ahead — at every stage of the journey. I don’t diagnose or give medical or legal advice; for those, I’ll help you get ready to talk with the right professional.',
  points: [
    {
      title: 'Try one of these',
      body: 'Ask “where are we right now?”, or about turning 18, IEP meetings, adult services, housing, employment, or long-term planning.',
    },
    {
      title: 'Or tell me where you are',
      body: 'Share what’s worrying you most, and I’ll point you to the right part of the journey.',
    },
  ],
  nextSteps: ['Explore the Journey Map', 'Review your next steps on the home page'],
  moduleLink: { label: 'Open the Journey Map', to: '/journey' },
}

/** Keywords that route to the LIVE status answer built from store state. */
export const statusMatch = [
  'where are we',
  'how are we doing',
  'status',
  "what's next",
  'what next',
  'what should we do',
  'next step',
]
