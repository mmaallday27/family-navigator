export interface DocCategory {
  id: string
  name: string
  description: string
  color: string // tailwind text/bg accent key
  /** Journey area the category belongs to — the Vault's information architecture. */
  group: DocGroupId
}

export type DocGroupId = 'education' | 'clinical' | 'benefits' | 'adult-life' | 'legal' | 'family'

export const docGroups: { id: DocGroupId; name: string; description: string }[] = [
  { id: 'education', name: 'Education', description: 'IEPs, 504s, evaluations, school records' },
  { id: 'clinical', name: 'Clinical & Developmental', description: 'Assessments, therapy, medical summaries' },
  { id: 'benefits', name: 'Benefits & Services', description: 'SSI, Medicaid, waivers, eligibility' },
  { id: 'adult-life', name: 'Transition & Adult Life', description: 'Vocational, employment, housing, independence' },
  { id: 'legal', name: 'Legal & Future Planning', description: 'Decision-making, trusts, ABLE, letters of intent' },
  { id: 'family', name: 'Family Records', description: 'Notes, correspondence, history — anything that matters' },
]

/**
 * A grounded, plain-language digest of a document analysis — stored in the
 * family record (so it exports and syncs) as the document's living knowledge.
 * Server keeps the full analysis; this is the load-bearing summary.
 */
export interface DocumentInsights {
  status: 'ok' | 'failed' | 'unsupported'
  docType?: string
  summary?: string
  analyzedAt?: string
  dates?: { date: string; label: string; kind: 'deadline' | 'renewal' | 'expiration' | 'meeting' | 'effective' | 'other'; verifyNote?: string }[]
  people?: { name: string; role: string }[]
  organizations?: string[]
  actionItems?: string[]
  openQuestions?: string[]
  connections?: { area: string; note: string }[]
  changesOrConflicts?: string[]
  nextSteps?: string[]
  inferenceNotes?: string
}

export interface DocFile {
  id: string
  name: string
  categoryId: string
  date: string
  size: string
  flagged?: boolean // needs attention / expiring
  note?: string
  /** True when real file bytes are stored on the server and downloadable. */
  hasFile?: boolean
  /** Digest of the grounded document analysis (full copy lives server-side). */
  insights?: DocumentInsights
}

export const docCategories: DocCategory[] = [
  // Education
  { id: 'iep', name: 'IEPs & 504s', description: 'Education plans, 504 plans & amendments', color: 'teal', group: 'education' },
  { id: 'eval', name: 'Evaluations', description: 'Diagnostic, psychoeducational & re-evaluations', color: 'lav', group: 'education' },
  { id: 'school', name: 'School Records', description: 'Progress reports, correspondence, meeting notes', color: 'teal', group: 'education' },
  // Clinical & Developmental
  { id: 'therapy', name: 'Therapy Reports', description: 'Speech, OT, PT, behavior', color: 'sage', group: 'clinical' },
  { id: 'medical', name: 'Medical Summaries', description: 'Records & medication (family-supplied)', color: 'sage', group: 'clinical' },
  // Benefits & Services
  { id: 'benefits', name: 'Benefits Paperwork', description: 'SSI, SSDI, Medicaid, waivers, eligibility letters', color: 'teal', group: 'benefits' },
  // Transition & Adult Life
  { id: 'transition', name: 'Transition Plans', description: 'Transition goals & assessments', color: 'amber', group: 'adult-life' },
  { id: 'vocational', name: 'Vocational & Employment', description: 'Assessments, ACCES-VR, employment plans', color: 'amber', group: 'adult-life' },
  { id: 'living', name: 'Housing & Independent Living', description: 'Residential, transportation, daily-living plans', color: 'amber', group: 'adult-life' },
  // Legal & Future Planning
  { id: 'legal', name: 'Legal Documents', description: 'Supported decision-making, guardianship, POA', color: 'rose', group: 'legal' },
  { id: 'future', name: 'Future Planning', description: 'Trusts, ABLE, letters of intent, future care', color: 'rose', group: 'legal' },
  // Family Records — the flexible home for everything else
  { id: 'family', name: 'Family Records', description: 'Notes, letters, history — your call what belongs here', color: 'lav', group: 'family' },
]

// Sample vault contents for the demo family. A family that onboards fresh
// starts with an empty vault and builds their own record over time.
export const demoDocFiles: DocFile[] = [
  { id: 'f1', name: '2026 IEP — Annual Review.pdf', categoryId: 'iep', date: 'Sep 19, 2025', size: '1.2 MB' },
  { id: 'f2', name: 'IEP Transition Goals (draft).docx', categoryId: 'transition', date: 'May 2, 2026', size: '88 KB', flagged: true, note: 'Needs your review before the fall meeting' },
  { id: 'f3', name: 'Psychoeducational Evaluation.pdf', categoryId: 'eval', date: 'Mar 11, 2024', size: '2.4 MB', flagged: true, note: 'Adult services may want a more recent eval' },
  { id: 'f4', name: 'Speech Therapy — Progress Summary.pdf', categoryId: 'therapy', date: 'Jan 14, 2026', size: '640 KB' },
  { id: 'f5', name: 'Occupational Therapy Plan.pdf', categoryId: 'therapy', date: 'Nov 2, 2025', size: '512 KB' },
  { id: 'f6', name: 'Vocational Interest Assessment.pdf', categoryId: 'transition', date: 'Pending — Oct 2026', size: '—', flagged: true, note: 'Scheduled, not yet uploaded' },
  { id: 'f7', name: 'SSI Research Notes.docx', categoryId: 'benefits', date: 'Jun 1, 2026', size: '32 KB' },
  { id: 'f8', name: 'Pediatrician — Medical Summary.pdf', categoryId: 'medical', date: 'Feb 20, 2026', size: '410 KB' },
  { id: 'f9', name: 'Medication List (current).pdf', categoryId: 'medical', date: 'May 28, 2026', size: '120 KB' },
  { id: 'f10', name: 'Diagnosis Letter (age 4).pdf', categoryId: 'eval', date: 'Apr 8, 2013', size: '300 KB' },
]
