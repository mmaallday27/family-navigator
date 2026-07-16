// The vault's storage system, treated honestly: a calm meter, plain-language
// heads-ups, and a plans panel with no dark patterns. The doctrine: storage
// can fill up, but the family's existing record is NEVER locked, hidden, or
// held hostage — everything stays viewable, downloadable, and exportable.

import { HardDrive, ChevronDown, Check } from 'lucide-react'
import type { StorageInfo } from '../../api'
import { cx } from '../../lib/cx'

/** Bytes in human units — KB/MB/GB, calm and unpadded. */
export function humanBytes(bytes: number): string {
  if (bytes < 1024) return `${Math.max(0, bytes)} B`
  if (bytes < 1_048_576) return `${Math.round(bytes / 1024)} KB`
  if (bytes < 1_073_741_824) return `${(bytes / 1_048_576).toFixed(1)} MB`
  return `${(bytes / 1_073_741_824).toFixed(2)} GB`
}

export function StorageMeter({ info }: { info: StorageInfo }) {
  const pct = Math.max(0, Math.min(100, info.percentUsed))
  const full = pct >= 100
  const nearing = pct >= 80 && !full

  return (
    <div className="card p-5">
      <div className="flex items-start gap-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-canvas text-ink-soft">
          <HardDrive className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
            <p className="text-sm font-medium text-ink">
              {humanBytes(info.bytesUsed)} of {humanBytes(info.limitBytes)} used
            </p>
            <p className="text-xs tabular-nums text-ink-faint">{Math.round(pct)}%</p>
          </div>
          <p className="text-xs text-ink-faint">
            {info.documentCount} {info.documentCount === 1 ? 'document' : 'documents'} stored ·{' '}
            {info.plan.name} plan
          </p>
          <div
            className="mt-2.5 h-2 w-full overflow-hidden rounded-full bg-line"
            role="progressbar"
            aria-label="Vault storage used"
            aria-valuenow={Math.round(pct)}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div
              className={cx(
                'h-full rounded-full transition-all duration-500',
                full || nearing ? 'bg-amber-400' : 'bg-teal-500',
              )}
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      </div>

      {nearing && (
        <p className="mt-3 rounded-xl bg-amber-50 px-4 py-2.5 text-xs leading-relaxed text-ink-soft">
          <span className="font-semibold text-amber-700">A gentle heads-up: </span>
          your vault is {Math.round(pct)}% full. Nothing changes yet — this is just so a full vault
          never takes you by surprise.
        </p>
      )}
      {full && (
        <p className="mt-3 rounded-xl bg-amber-50 px-4 py-2.5 text-xs leading-relaxed text-ink-soft">
          <span className="font-semibold text-amber-700">Your storage is full, </span>
          so new file uploads are paused for now. Nothing you&rsquo;ve stored is ever locked —
          every document stays viewable, downloadable, and exportable, always.
        </p>
      )}

      <details className="group mt-3">
        <summary className="inline-flex cursor-pointer list-none items-center gap-1.5 text-xs font-semibold text-teal-700 hover:text-teal-800">
          About storage plans
          <ChevronDown className="h-3.5 w-3.5 transition-transform group-open:rotate-180" />
        </summary>
        <div className="mt-3 space-y-2.5">
          <p className="text-xs leading-relaxed text-ink-soft">
            A family&rsquo;s record grows over a lifetime. If yours outgrows its space, here&rsquo;s
            how to preserve more of it — and whatever your plan, everything already in your vault
            remains yours to view and export.
          </p>
          <ul className="space-y-2">
            {info.tiers.map((tier) => (
              <li
                key={tier.id}
                className="flex items-start justify-between gap-3 rounded-xl bg-canvas px-3.5 py-2.5"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-ink">
                    {tier.name}{' '}
                    <span className="text-xs font-normal text-ink-faint">
                      · {humanBytes(tier.limitBytes)}
                    </span>
                  </p>
                  <p className="mt-0.5 text-xs leading-relaxed text-ink-soft">{tier.blurb}</p>
                </div>
                {tier.id === info.plan.id ? (
                  <span className="chip shrink-0 bg-teal-50 text-teal-700">
                    <Check className="h-3 w-3" /> Your plan
                  </span>
                ) : !tier.available ? (
                  <span className="chip shrink-0 border border-line bg-surface text-ink-faint">
                    Coming soon
                  </span>
                ) : null}
              </li>
            ))}
          </ul>
        </div>
      </details>
    </div>
  )
}
