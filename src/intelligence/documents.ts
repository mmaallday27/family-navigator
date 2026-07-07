// Document understanding. When a family adds a document, the platform reads
// what KIND of moment this is (an IEP, a denial letter, an evaluation…) and
// responds: what it means, what to do, what deadlines commonly apply, and how
// the rest of the record should react. In this prototype the analysis is
// template-driven from the category and filename — the interface is designed
// so a live model can replace the internals without touching any screen.

import type { FamilyState } from '../store/FamilyContext'
import { firstName, getAge } from '../store/selectors'

export interface DocumentAnalysis {
  /** What this document is, in one calm sentence. */
  summary: string
  actionItems: string[]
  /** Deadlines phrased as guidance — verify against the letter itself. */
  deadlines: string[]
  /** Things commonly missing from this document type — worth double-checking. */
  checkFor: string[]
  /** How the rest of the platform responds (cross-screen intelligence). */
  updates: string[]
  professionalNote?: string
}

export function analyzeDocument(
  docName: string,
  categoryId: string,
  state: FamilyState,
  now: Date = new Date(),
): DocumentAnalysis {
  const name = firstName(state.child.name)
  const age = getAge(state.child, now)
  const lower = docName.toLowerCase()

  // Filename cues refine the category (a denial letter files under "benefits").
  const isDenial = lower.includes('denial') || lower.includes('denied') || lower.includes('appeal')
  const isWaiver = lower.includes('waiver')

  if (categoryId === 'benefits' && isDenial) {
    return {
      summary: `A benefits denial letter for ${name}. Denials are common on first application and are frequently overturned on appeal — this is a setback, not a verdict.`,
      actionItems: [
        'Read the stated reason for denial carefully — it determines the appeal strategy',
        'Gather the evidence the letter says was missing or insufficient',
        'Consider asking a benefits counselor or attorney to review before filing',
      ],
      deadlines: [
        'Appeal windows are commonly 60 days from the date on the letter — verify the exact deadline printed on yours',
      ],
      checkFor: ['The specific denial reason', 'The appeal instructions and address', 'The date of the letter (the clock starts there)'],
      updates: [
        'Added to Benefits Paperwork so it’s ready for the appeal',
        'The companion can walk through “what happens if SSI is denied”',
      ],
      professionalNote:
        'Appeals have real deadlines and legal weight — a benefits counselor or special-needs attorney should review this letter.',
    }
  }

  switch (categoryId) {
    case 'iep':
      return {
        summary: `${name}’s IEP — the legal backbone of school services. Filed and ready for every meeting, evaluation, and dispute.`,
        actionItems: [
          'Check that every service has minutes, frequency, and a named provider',
          age >= 13
            ? 'Confirm measurable transition goals are included (required around age 14+)'
            : 'Note the goals so you can track progress against them each term',
          'Mark the annual review date on your calendar',
        ],
        deadlines: ['IEPs are reviewed at least annually — the next review is typically within 12 months of this one'],
        checkFor: ['Measurable goals (numbers, not adjectives)', 'Service minutes actually delivered', 'Parent concerns recorded in the document'],
        updates: [
          'Journey Map: School/Transition stage record strengthened',
          age >= 13 ? 'Transition Navigator: “transition goals in the IEP” is worth confirming on the checklist' : 'Filed for the next school meeting',
        ],
      }
    case 'transition':
      return {
        summary: `A transition planning document for ${name} — this is the roadmap the school team is legally required to follow toward adult life.`,
        actionItems: [
          'Check the three required goal areas: education/training, employment, independent living',
          'Confirm the goals reflect ' + name + '’s actual strengths and interests, not generic templates',
          'Share it with your transition coordinator if you have one',
        ],
        deadlines: ['Transition goals are updated at every annual IEP — bring your edits to the next meeting'],
        checkFor: ['Vague goals (“will explore careers”) that can’t be measured', 'Missing agency connections (VR, adult services)', 'Whether ' + name + ' participated in writing it'],
        updates: [
          'Transition Navigator: checklist items about IEP transition goals relate to this document',
          'Meeting prep: the companion will reference this when preparing IEP questions',
        ],
      }
    case 'eval':
      return {
        summary: `An evaluation for ${name}. Evaluations unlock services — and their freshness matters: many adult agencies want one from the last ~3 years.`,
        actionItems: [
          'Read the recommendations section first — it drives services',
          'Note the strengths the evaluator recorded, not just the needs',
          'Keep the full report; summaries often omit what agencies need',
        ],
        deadlines: age >= 15 ? ['If this evaluation is more than ~2–3 years old when adult services are applied for, agencies may require a new one — plan re-evaluation timing around age 16–17'] : [],
        checkFor: ['The evaluation date (freshness drives eligibility)', 'Standard scores agencies will ask for', 'Signed credentials of the evaluator'],
        updates: ['Vault: evaluation gap for this stage is now covered', 'Adult-service and VR applications can reference this document'],
      }
    case 'legal':
      return {
        summary: `A legal document in ${name}’s record. These papers carry long-term weight — originals and copies both matter.`,
        actionItems: [
          'Confirm who holds the original and where it’s stored',
          'Share copies with the people named in it',
          'Revisit it after major life changes (age 18, moves, new diagnoses)',
        ],
        deadlines: ['Some legal instruments (powers of attorney, consents) have renewal or review dates — check the document’s own terms'],
        checkFor: ['Signatures and notarization', 'Effective dates', 'Whether it still reflects your current wishes'],
        updates: ['Journey Map: Future Planning & Legacy record strengthened'],
        professionalNote: 'Legal documents should be reviewed with your attorney — this platform organizes them but can’t interpret them.',
      }
    case 'benefits':
      return {
        summary: isWaiver
          ? `Waiver paperwork for ${name}. Waivers fund the supports that make adult life work — and their dates and renewals are unforgiving.`
          : `Benefits paperwork for ${name}. Benefits decisions are built on paper trails — this is exactly the right place for it.`,
        actionItems: [
          'Note any case numbers and contact names on the document',
          'Record where you are in the process (applied, waitlisted, active, renewal)',
          isWaiver ? 'Confirm your position on the waitlist annually' : 'Keep income/resource records alongside this document',
        ],
        deadlines: [
          'Benefits letters often contain response windows (commonly 10–60 days) — check the date printed on the letter',
          isWaiver ? 'Waivers typically require periodic renewal — note the renewal date if one is listed' : 'SSI is re-determined under adult rules at 18',
        ],
        checkFor: ['Dates and deadlines printed on the letter', 'Case/reference numbers', 'What the letter asks you to send back'],
        updates: ['Vault: benefits record for the age-18 season is building', 'Dashboard: benefits-related risks recalculated'],
        professionalNote: 'For eligibility questions, a benefits counselor (often free through your state) reads these letters every day.',
      }
    case 'medical':
      return {
        summary: `A medical record for ${name}. Kept current, these prevent every new provider from starting at zero.`,
        actionItems: [
          'Check the medication list is current',
          'Note anything that changed since the last visit',
          'Share with new providers before first appointments',
        ],
        deadlines: [],
        checkFor: ['Current medications and dosages', 'Provider contact information', 'Dates of the most recent visits'],
        updates: ['Filed for medical appointments and benefits documentation'],
      }
    case 'therapy':
      return {
        summary: `A therapy report for ${name}. Progress notes are quiet evidence — they show what works and justify continued services.`,
        actionItems: [
          'Note the progress described and the goals still open',
          'Bring it to the next IEP or insurance conversation',
        ],
        deadlines: ['Insurance reauthorizations often ask for recent progress notes — keep the newest one easy to find'],
        checkFor: ['Measurable progress statements', 'Recommended frequency of services', 'The therapist’s signature and date'],
        updates: ['Filed alongside evaluations for service justification'],
      }
    default:
      return {
        summary: `Added to ${name}’s record. Every document strengthens the one living history your family never has to reconstruct.`,
        actionItems: ['File it in the most specific category that fits', 'Add a note about why it matters if it isn’t obvious'],
        deadlines: [],
        checkFor: ['Dates, signatures, and reference numbers'],
        updates: ['Family record updated'],
      }
  }
}
