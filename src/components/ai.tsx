// The visual language of intelligence. Every AI-derived element in the product
// uses these components so families always know (a) this came from the AI and
// (b) whether it's a fact from their record or a suggestion — the trust layer.

import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import {
  Sparkles,
  CalendarClock,
  AlertTriangle,
  ListChecks,
  Gift,
  PartyPopper,
  ArrowRight,
  X,
  Clock,
  Database,
  BookOpen,
} from 'lucide-react'
import { cx } from '../lib/cx'
import type { Insight, InsightKind } from '../intelligence/insights'

/** Trust badge: was this computed from the family's record, or general guidance? */
export function SourceBadge({ kind }: { kind: 'record' | 'educational' }) {
  return kind === 'record' ? (
    <span className="chip bg-teal-50 text-teal-700">
      <Database className="h-3 w-3" /> From your family record
    </span>
  ) : (
    <span className="chip bg-lav-50 text-lav-600">
      <BookOpen className="h-3 w-3" /> General guidance
    </span>
  )
}

/**
 * An inline strip of contextual intelligence — the ambient AI presence that
 * lives on every screen (Journey Map, Vault, Resources, Transition…).
 */
export function AiNote({
  title = 'From your navigator',
  children,
  action,
}: {
  title?: string
  children: ReactNode
  action?: ReactNode
}) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-teal-100 bg-gradient-to-r from-teal-50/70 to-lav-50/40 p-4">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-teal-100 text-teal-600">
        <Sparkles className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold uppercase tracking-wide text-teal-700">{title}</p>
        <div className="mt-1 text-sm leading-relaxed text-ink-soft">{children}</div>
        {action && <div className="mt-2">{action}</div>}
      </div>
    </div>
  )
}

const kindStyle: Record<InsightKind, { icon: ReactNode; chip: string; label: string }> = {
  deadline: {
    icon: <CalendarClock className="h-4 w-4" />,
    chip: 'bg-amber-50 text-amber-600',
    label: 'Coming up',
  },
  risk: {
    icon: <AlertTriangle className="h-4 w-4" />,
    chip: 'bg-rose-50 text-rose-500',
    label: 'Worth attention',
  },
  action: {
    icon: <ListChecks className="h-4 w-4" />,
    chip: 'bg-teal-50 text-teal-700',
    label: 'Next step',
  },
  opportunity: {
    icon: <Gift className="h-4 w-4" />,
    chip: 'bg-lav-50 text-lav-600',
    label: 'Opportunity',
  },
  celebration: {
    icon: <PartyPopper className="h-4 w-4" />,
    chip: 'bg-sage-50 text-sage-600',
    label: 'Milestone',
  },
}

/** A proactive insight card — deadline, risk, next step, opportunity, or win. */
export function AiInsightCard({
  insight,
  onDismiss,
}: {
  insight: Insight
  onDismiss?: (id: string) => void
}) {
  const style = kindStyle[insight.kind]
  return (
    <div className="card relative flex flex-col p-5">
      {onDismiss && (
        <button
          onClick={() => onDismiss(insight.id)}
          className="absolute right-3 top-3 rounded-lg p-1.5 text-ink-faint hover:bg-canvas hover:text-ink-soft"
          aria-label={`Dismiss “${insight.title}”`}
          title="Dismiss — I've handled this"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
      <div className="flex items-center gap-2 pr-8">
        <span className={cx('chip', style.chip)}>
          {style.icon} {style.label}
        </span>
        {insight.minutes && (
          <span className="inline-flex items-center gap-1 text-xs text-ink-faint">
            <Clock className="h-3 w-3" /> {insight.minutes} min
          </span>
        )}
      </div>
      <h3 className="mt-3 font-semibold leading-snug text-ink">{insight.title}</h3>
      <p className="mt-1.5 flex-1 text-sm leading-relaxed text-ink-soft">{insight.body}</p>
      <div className="mt-3 flex items-center justify-between gap-2">
        <Link
          to={insight.to}
          className="inline-flex items-center gap-1 text-sm font-semibold text-teal-600 hover:gap-2"
        >
          {insight.linkLabel} <ArrowRight className="h-4 w-4 transition-all" />
        </Link>
        <span className="text-[10px] uppercase tracking-wide text-ink-faint">
          {insight.isFact ? 'from your record' : 'suggestion'}
        </span>
      </div>
    </div>
  )
}
