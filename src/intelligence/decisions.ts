// Decision support. The platform never chooses for a family — it lays out the
// options, the honest tradeoffs, the questions that reveal fit, and the
// professional who should be in the room. Educational, never prescriptive.

import type { CompanionResponse } from '../data/companion'
import type { FamilyState } from '../store/FamilyContext'
import { firstName } from '../store/selectors'

export interface DecisionTopic {
  id: string
  match: string[]
  prompt: string
  build: (state: FamilyState) => CompanionResponse
}

export const decisionTopics: DecisionTopic[] = [
  {
    id: 'guardianship-vs-sdm',
    match: ['guardianship', 'supported decision', 'decision-making', 'power of attorney', 'conservator'],
    prompt: 'Compare guardianship vs. supported decision-making',
    build: (state) => {
      const name = firstName(state.child.name)
      return {
        kind: 'educational',
        intro: `This is one of the biggest decisions of the age-18 season, and there’s no universally right answer — only the right fit for ${name}. Here’s the landscape, honestly.`,
        sections: [
          {
            heading: 'Supported decision-making (SDM)',
            items: [
              `${name} keeps all legal rights and formally names trusted supporters`,
              'Pros: preserves autonomy and dignity; flexible; increasingly recognized in state law',
              'Cons: requires capacity to sign and ongoing cooperation; some institutions honor it slowly',
            ],
          },
          {
            heading: 'Powers of attorney & healthcare proxy',
            items: [
              `${name} voluntarily delegates specific decisions (medical, financial) — revocable anytime`,
              'Pros: targeted, no court involvement, widely recognized',
              'Cons: requires capacity to sign; covers only what it names',
            ],
          },
          {
            heading: 'Guardianship (full or limited)',
            items: [
              'A court transfers decision rights to a guardian after a capacity hearing',
              'Pros: strongest authority; institutions respond to court orders immediately',
              'Cons: most restrictive; removes rights; hard to reverse; annual court reporting',
            ],
          },
          {
            heading: 'Questions that reveal the right fit',
            items: [
              `Which specific decisions does ${name} actually need support with — and which can ${name} own?`,
              'Has anything gone wrong under informal support, or is this precautionary?',
              'What does the least restrictive option that still keeps ' + name + ' safe look like?',
            ],
          },
        ],
        points: [],
        nextSteps: ['Write the list of real decisions that need support — it does most of the work', 'Bring the list to a special-needs attorney consultation'],
        moduleLink: { label: 'Prepare for the attorney meeting', to: '/companion' },
        professionalNote: 'Capacity and legal instruments are attorney territory. This comparison prepares you for that conversation — it doesn’t replace it.',
      }
    },
  },
  {
    id: 'ssi-vs-ssdi',
    match: ['ssi vs', 'ssdi', 'ssi versus', 'difference between ssi'],
    prompt: 'Explain SSI vs. SSDI',
    build: (state) => {
      const name = firstName(state.child.name)
      return {
        kind: 'educational',
        intro: 'These two programs get confused constantly because the acronyms rhyme — but they work completely differently. The plain-language version:',
        sections: [
          {
            heading: 'SSI (Supplemental Security Income)',
            items: [
              'Needs-based: eligibility depends on disability AND limited income/resources',
              'At 18, ' + name + ' is assessed on their own finances — parental income stops counting',
              'Usually brings Medicaid with it (the quiet headline — Medicaid funds most disability services)',
            ],
          },
          {
            heading: 'SSDI (Social Security Disability Insurance)',
            items: [
              'Insurance-based: paid from a work record — usually a parent’s, via the Disabled Adult Child (DAC) benefit',
              'DAC can begin when a parent retires, becomes disabled, or dies — if the disability began before 22',
              'Often pays more than SSI, and brings Medicare after 24 months',
            ],
          },
          {
            heading: 'The practical takeaways',
            items: [
              'Many people receive both at different points in life — this isn’t either/or forever',
              'Getting the disability determination on record before 22 protects future DAC eligibility',
              'Asset limits make SSI fragile — this is why ABLE accounts and special needs trusts exist',
            ],
          },
        ],
        points: [],
        nextSteps: ['Research SSI under adult rules in the Age 18 track', 'Ask a benefits counselor to map both programs against your family’s work records'],
        moduleLink: { label: 'Open the Age 18 track', to: '/transition' },
        professionalNote: 'Eligibility math is fact-specific — a benefits counselor (often free through your state) should run your actual numbers.',
      }
    },
  },
  {
    id: 'housing-options',
    match: ['housing options', 'compare housing', 'living options', 'housing models', 'where will'],
    prompt: 'Compare housing options',
    build: (state) => {
      const name = firstName(state.child.name)
      return {
        kind: 'educational',
        intro: `Housing is a spectrum, and most families move along it over time rather than choosing once. The main models, with their honest tradeoffs:`,
        sections: [
          {
            heading: 'Living with family, with supports',
            items: ['The most common arrangement well into adulthood', 'Pros: continuity, cost, safety', 'Cons: caregiver sustainability — respite and in-home supports are what make it durable'],
          },
          {
            heading: 'Supported independent living',
            items: [`${name}’s own apartment with scheduled or drop-in support, often waiver-funded`, 'Pros: maximum independence and dignity', 'Cons: depends on waiver funding and support hours; loneliness is the quiet risk'],
          },
          {
            heading: 'Shared living / host families',
            items: ['Living with a trained, paid companion or family', 'Pros: built-in relationship and lower cost', 'Cons: quality varies enormously — vetting is everything'],
          },
          {
            heading: 'Group homes & intentional communities',
            items: ['Staffed homes or planned communities', 'Pros: 24/7 structure and peers', 'Cons: waitlists, less autonomy, quality varies — tour more than once, unannounced'],
          },
          {
            heading: 'Questions that reveal fit',
            items: [
              `What does ${name} need to feel at home — routines, sensory environment, people?`,
              'What support is actually needed at 7am, 7pm, and 2am?',
              'What happens to the arrangement if funding or a caregiver changes?',
            ],
          },
        ],
        points: [],
        nextSteps: ['Tour one model this year, even casually — intuition builds early', 'Ask about waiver-funded residential supports in your area'],
        moduleLink: { label: 'Find adult service agencies', to: '/resources' },
        professionalNote: 'Funding eligibility is determined by your state’s waiver programs — your adult-services agency or a benefits counselor can map what applies.',
      }
    },
  },
  {
    id: 'vocational-pathways',
    match: ['vocational programs', 'compare vocational', 'employment options', 'job programs', 'work options', 'employment pathways'],
    prompt: 'Compare employment pathways',
    build: (state) => {
      const name = firstName(state.child.name)
      return {
        kind: 'educational',
        intro: `Employment isn’t one door — it’s several, and they can be tried in sequence. The main pathways for ${name}:`,
        sections: [
          {
            heading: 'Competitive integrated employment (with supports)',
            items: ['A regular job at regular wages, with job coaching that fades over time', 'Pros: real wages, real inclusion, best long-term outcomes', 'Cons: needs a good job match — fit matters more than speed'],
          },
          {
            heading: 'Customized employment',
            items: ['A job carved around ' + name + '’s specific strengths, negotiated with an employer', 'Pros: built on strengths and interests — often the best fit for distinct profiles', 'Cons: fewer providers know how to do it well; ask for examples'],
          },
          {
            heading: 'Post-secondary & training programs',
            items: ['Inclusive college programs, vocational certificates, Pre-ETS through VR', 'Pros: skills plus the college experience', 'Cons: cost and fit vary — visit before committing'],
          },
          {
            heading: 'Day programs with employment tracks',
            items: ['Structured days that can include work crews or volunteering', 'Pros: structure and community from day one', 'Cons: can become a destination instead of a pathway — ask about movement toward real employment'],
          },
        ],
        points: [],
        nextSteps: [`Write down ${name}’s strengths and interests — every good pathway starts there`, 'Compare two local programs in the Resource Navigator', 'Ask each program: “How do you match jobs to strengths, and what happens if the first job isn’t right?”'],
        moduleLink: { label: 'See vocational programs', to: '/resources' },
      }
    },
  },
]

export function matchDecision(input: string): DecisionTopic | undefined {
  const q = input.toLowerCase()
  const comparative = /(compare|versus|\bvs\b|difference between|which is|options|or supported)/.test(q)
  return decisionTopics.find((d) => d.match.some((m) => q.includes(m)) && (comparative || d.match.some((m) => m.length > 10 && q.includes(m))))
}
