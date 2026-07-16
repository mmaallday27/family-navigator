// Per-document intelligence: the grounded reading of a document's REAL bytes.
// Honesty rules this component. Facts drawn from the document sit above the
// "Beyond the document itself" divider; anything the navigator inferred sits
// below it, clearly labeled. A failed or unsupported analysis renders an
// honest empty state — never fabricated content.

import { useState } from 'react'
import { Sparkles, ChevronDown, FileSearch, RefreshCw } from 'lucide-react'
import type { ReactNode } from 'react'
import type { DocFile, DocumentInsights } from '../../data/documents'
import { apiAnalyzeDocument, apiGetAnalysis, type DocumentAnalysis } from '../../api'

// --- The digest: what gets stored in the family record ---------------------
// The server keeps the full analysis; the record carries a lean digest so the
// blob stays small enough to sync and export for decades. Arrays cap at 8
// entries, free text at 800 characters.

const LIST_CAP = 8
const TEXT_CAP = 800

function capList<T>(items: T[] | undefined): T[] | undefined {
  return items && items.length > 0 ? items.slice(0, LIST_CAP) : undefined
}

function capText(text: string | undefined): string | undefined {
  return text ? text.slice(0, TEXT_CAP) : undefined
}

export function buildInsightsDigest(analysis: DocumentAnalysis): DocumentInsights {
  return {
    status: 'ok',
    docType: analysis.docType,
    summary: capText(analysis.summary),
    analyzedAt: analysis.analyzedAt ?? new Date().toISOString(),
    dates: capList(analysis.dates),
    people: capList(analysis.people),
    organizations: capList(analysis.organizations),
    actionItems: capList(analysis.actionItems),
    openQuestions: capList(analysis.openQuestions),
    connections: capList(analysis.connections),
    changesOrConflicts: capList(analysis.changesOrConflicts),
    nextSteps: capList(analysis.nextSteps),
    inferenceNotes: capText(analysis.inferenceNotes),
  }
}

// --- Small presentation helpers ---------------------------------------------

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-teal-700">{title}</p>
      <div className="mt-1">{children}</div>
    </div>
  )
}

function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-1.5">
      {items.map((item) => (
        <li key={item} className="flex gap-2 text-sm leading-relaxed text-ink-soft">
          <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-teal-300" />
          {item}
        </li>
      ))}
    </ul>
  )
}

function formatAnalyzedAt(iso?: string): string | null {
  if (!iso) return null
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return null
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

// --- The panel ---------------------------------------------------------------

export function DocumentInsightsPanel({
  doc,
  onStore,
}: {
  doc: DocFile
  /** Persist a digest into the family record (set-document-insights). */
  onStore: (insights: DocumentInsights) => void
}) {
  const [running, setRunning] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Metadata-only entries have no bytes on the server — nothing to read.
  if (!doc.hasFile) {
    return (
      <p className="text-xs text-ink-faint">
        This entry is a placeholder — only uploaded files can be analyzed. Add the file itself
        whenever it&rsquo;s handy.
      </p>
    )
  }

  const analyze = async () => {
    setRunning(true)
    setError(null)
    try {
      const { analysis } = await apiAnalyzeDocument(doc.id)
      onStore(buildInsightsDigest(analysis))
    } catch (err) {
      setError(
        err instanceof Error && err.message
          ? err.message
          : 'The document couldn’t be read just now. Your file is untouched — please try again.',
      )
      // Only record a failed/unsupported status if the SERVER says the
      // analysis itself reached that outcome (422/502 store a result there).
      // Transient conditions — AI not configured (503), rate limits (429),
      // network blips — store nothing, so a later retry starts clean.
      try {
        const check = await apiGetAnalysis(doc.id)
        if (check.status === 'failed' || check.status === 'unsupported') {
          onStore({ status: check.status })
        }
      } catch {
        // Couldn't confirm — treat as transient; store nothing.
      }
    } finally {
      setRunning(false)
    }
  }

  if (running) {
    return (
      <p className="inline-flex items-center gap-2 text-xs text-ink-soft" role="status">
        <RefreshCw className="h-3.5 w-3.5 animate-spin text-teal-600" />
        Reading the actual document — this can take up to a minute.
      </p>
    )
  }

  const insights = doc.insights

  // Unsupported: honest, final, nothing invented.
  if (insights?.status === 'unsupported') {
    return (
      <p className="text-xs leading-relaxed text-ink-faint">
        This file type can&rsquo;t be read for analysis yet. The document itself is stored safely
        and stays downloadable — nothing here is guessed at.
      </p>
    )
  }

  // Failed (stored) or a transient error just now: honest message + retry.
  if (insights?.status === 'failed' || error) {
    return (
      <div className="space-y-1.5">
        <p className="text-xs leading-relaxed text-ink-soft">
          {error ??
            'The last reading of this document didn’t finish, and nothing was invented in its place. Your file is stored and unchanged.'}
        </p>
        <button
          type="button"
          onClick={analyze}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-700 hover:text-teal-800"
        >
          <RefreshCw className="h-3.5 w-3.5" /> Try again
        </button>
      </div>
    )
  }

  // No insights yet: offer the analysis.
  if (!insights) {
    return (
      <button
        type="button"
        onClick={analyze}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-700 hover:text-teal-800"
      >
        <Sparkles className="h-3.5 w-3.5" /> Analyze this document
      </button>
    )
  }

  // status 'ok' — the compact, expandable reading of the document.
  const analyzedOn = formatAnalyzedAt(insights.analyzedAt)
  const mentions = [
    ...(insights.people ?? []).map((p) => (p.role ? `${p.name} (${p.role})` : p.name)),
    ...(insights.organizations ?? []),
  ]

  return (
    <details className="group rounded-xl border border-teal-100 bg-teal-50/40">
      <summary className="flex cursor-pointer list-none flex-wrap items-center gap-2 px-3.5 py-2.5 text-sm font-medium text-ink-soft">
        <Sparkles className="h-4 w-4 shrink-0 text-teal-500" />
        What this document tells us
        {insights.docType && <span className="chip bg-teal-50 text-teal-700">{insights.docType}</span>}
        <ChevronDown className="ml-auto h-4 w-4 shrink-0 text-ink-faint transition-transform group-open:rotate-180" />
      </summary>
      <div className="space-y-3 px-3.5 pb-3.5">
        <div>
          <span className="chip bg-teal-50 text-teal-700">
            <FileSearch className="h-3 w-3" /> From this document
          </span>
        </div>

        {insights.summary && (
          <p className="text-sm leading-relaxed text-ink">{insights.summary}</p>
        )}

        {insights.dates && insights.dates.length > 0 && (
          <Section title="Key dates">
            <ul className="space-y-1.5">
              {insights.dates.map((d, i) => (
                <li key={`${d.date}-${i}`} className="text-sm leading-relaxed text-ink-soft">
                  <span className="font-semibold text-ink">{d.date}</span> — {d.label}
                  <span className="ml-1.5 text-[10px] uppercase tracking-wide text-ink-faint">
                    {d.kind}
                  </span>
                  {d.verifyNote && (
                    <span className="block text-xs text-amber-600">Verify: {d.verifyNote}</span>
                  )}
                </li>
              ))}
            </ul>
          </Section>
        )}

        {insights.actionItems && insights.actionItems.length > 0 && (
          <Section title="Action items">
            <BulletList items={insights.actionItems} />
          </Section>
        )}

        {insights.openQuestions && insights.openQuestions.length > 0 && (
          <Section title="Open questions">
            <BulletList items={insights.openQuestions} />
          </Section>
        )}

        {insights.changesOrConflicts && insights.changesOrConflicts.length > 0 && (
          <Section title="Changes or conflicts to note">
            <BulletList items={insights.changesOrConflicts} />
          </Section>
        )}

        {insights.connections && insights.connections.length > 0 && (
          <Section title="How this connects">
            <ul className="space-y-1.5">
              {insights.connections.map((c, i) => (
                <li key={`${c.area}-${i}`} className="text-sm leading-relaxed text-ink-soft">
                  <span className="font-semibold text-ink">{c.area}:</span> {c.note}
                </li>
              ))}
            </ul>
          </Section>
        )}

        {insights.nextSteps && insights.nextSteps.length > 0 && (
          <Section title="Next steps">
            <BulletList items={insights.nextSteps} />
          </Section>
        )}

        {mentions.length > 0 && (
          <p className="text-xs leading-relaxed text-ink-faint">
            <span className="font-semibold text-ink-soft">Mentions: </span>
            {mentions.join(' · ')}
          </p>
        )}

        {insights.inferenceNotes && (
          <div className="border-t border-teal-100 pt-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-lav-600">
              Beyond the document itself
            </p>
            <p className="mt-0.5 text-[11px] text-ink-faint">
              The navigator&rsquo;s own reading — context it drew, not statements made by the
              document.
            </p>
            <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">{insights.inferenceNotes}</p>
          </div>
        )}

        {analyzedOn && (
          <p className="text-[11px] text-ink-faint">
            Analyzed {analyzedOn} · always verify dates and requirements against the document
            itself.
          </p>
        )}
      </div>
    </details>
  )
}
