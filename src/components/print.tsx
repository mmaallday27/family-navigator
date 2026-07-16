// Shared helpers for the printable handoff artifacts (Family Summary and
// Meeting Prep). The `.print-sheet` region is the only thing that survives
// `window.print()` — see the `@media print` block appended to src/index.css.
// Everything marked `.no-print` (toggles, buttons, editing chrome) stays on
// screen only, so what the family previews is exactly what a teacher or a
// meeting table receives.

import { useState, type ReactNode } from 'react'
import { Printer } from 'lucide-react'

/**
 * Section on/off state for a printable sheet. The family controls what's
 * included — sensible defaults on, sensitive sections off until chosen.
 */
export function usePrintSections<K extends string>(defaults: Record<K, boolean>) {
  const [sections, setSections] = useState(defaults)
  const toggle = (key: K) => setSections((prev) => ({ ...prev, [key]: !prev[key] }))
  return { sections, toggle }
}

/** Checkbox row controlling whether a section appears on the printed sheet. */
export function SectionToggle({
  label,
  checked,
  onToggle,
  note,
}: {
  label: string
  checked: boolean
  onToggle: () => void
  note?: string
}) {
  return (
    <label className="no-print flex cursor-pointer items-start gap-2.5 rounded-lg px-2 py-1.5 hover:bg-canvas">
      <input
        type="checkbox"
        checked={checked}
        onChange={onToggle}
        className="mt-0.5 h-4 w-4 shrink-0 accent-teal-600"
      />
      <span className="min-w-0 text-sm leading-snug">
        <span className="font-medium text-ink">{label}</span>
        {note && <span className="mt-0.5 block text-xs text-ink-faint">{note}</span>}
      </span>
    </label>
  )
}

/** Print button plus the one-line save-as-PDF hint. */
export function PrintActions() {
  return (
    <div className="no-print">
      <button type="button" onClick={() => window.print()} className="btn-primary">
        <Printer className="h-4 w-4" /> Print
      </button>
      <p className="mt-2 max-w-[16rem] text-xs leading-relaxed text-ink-faint">
        To keep a PDF, choose “Save as PDF” as the destination in the print dialog.
      </p>
    </div>
  )
}

/** The printable page region. Only its contents appear on paper. */
export function PrintSheet({ children }: { children: ReactNode }) {
  return <div className="print-sheet card w-full bg-white p-8 sm:p-10">{children}</div>
}

/** The chrome line at the top of every printed artifact. */
export function PrintHeader({ preparedBy }: { preparedBy: string }) {
  const today = new Date().toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
  return (
    <p className="text-xs tracking-wide text-ink-faint">
      Prepared by {preparedBy || 'the family'} with Family Navigator — {today}
    </p>
  )
}

/** The confidentiality note that closes every printed artifact. */
export function PrintFooter() {
  return (
    <p className="mt-8 border-t border-line pt-3 text-xs italic text-ink-faint">
      Shared by the family. Please treat as confidential.
    </p>
  )
}

/**
 * A compact titled block on the sheet. When a section has no real content
 * (`has={false}`), the calm hint shows in the on-screen preview but the whole
 * block is excluded from print — an empty heading never reaches paper.
 */
export function SheetSection({
  title,
  has = true,
  hint,
  children,
}: {
  title: string
  /** False when the record has nothing for this section yet. */
  has?: boolean
  /** Preview-only guidance shown when the section is empty. */
  hint?: string
  children?: ReactNode
}) {
  const section = (
    <section className="mt-5">
      <h2 className="border-b border-line pb-1 text-[13px] font-semibold uppercase tracking-wider text-ink-soft">
        {title}
      </h2>
      <div className="mt-2 text-sm leading-relaxed text-ink">
        {has ? children : <p className="text-xs italic text-ink-faint">{hint}</p>}
      </div>
    </section>
  )
  return has ? section : <div className="no-print">{section}</div>
}

/** An empty checkbox line for on-paper follow-ups written by hand. */
export function CheckLine({ children }: { children: ReactNode }) {
  return (
    <li className="flex items-start gap-2.5 py-1">
      <span aria-hidden className="mt-0.5 inline-block h-4 w-4 shrink-0 rounded-[3px] border border-ink-faint" />
      <span className="min-w-0 flex-1">{children}</span>
    </li>
  )
}

/** Blank ruled lines for handwritten notes during the meeting. */
export function NoteLines({ count = 8 }: { count?: number }) {
  return (
    <div aria-hidden>
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="h-7 border-b border-line" />
      ))}
    </div>
  )
}
