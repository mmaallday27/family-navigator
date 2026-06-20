export interface DocCategory {
  id: string
  name: string
  description: string
  color: string // tailwind text/bg accent key
}

export interface DocFile {
  id: string
  name: string
  categoryId: string
  date: string
  size: string
  flagged?: boolean // needs attention / expiring
  note?: string
}

export const docCategories: DocCategory[] = [
  { id: 'iep', name: 'IEPs', description: 'Education plans & amendments', color: 'teal' },
  { id: 'eval', name: 'Evaluations', description: 'Diagnostic & re-evaluations', color: 'lav' },
  { id: 'therapy', name: 'Therapy Reports', description: 'Speech, OT, behavior', color: 'sage' },
  { id: 'transition', name: 'Transition Plans', description: 'Goals & assessments', color: 'amber' },
  { id: 'benefits', name: 'Benefits Paperwork', description: 'SSI, Medicaid, waivers', color: 'teal' },
  { id: 'legal', name: 'Legal Documents', description: 'Guardianship, trusts, POA', color: 'rose' },
  { id: 'medical', name: 'Medical Summaries', description: 'Records & medication', color: 'sage' },
]

export const docFiles: DocFile[] = [
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
