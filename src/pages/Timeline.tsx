// The Family Timeline — the road already walked. A living history assembled
// from the record: milestones, documents, decisions, and services, in order.
// Families should see progress over years, not just today's tasks.

import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  History,
  ArrowRight,
  Flag,
  FileText,
  Scale,
  HeartHandshake,
  Circle,
  Telescope,
} from 'lucide-react'
import { PageHeader, EmptyState } from '../components/ui'
import { AiNote } from '../components/ai'
import { useFamily } from '../store/FamilyContext'
import { firstName, getAge } from '../store/selectors'
import { buildTimeline, type TimelineKind } from '../intelligence/lookahead'
import { cx } from '../lib/cx'

const kindMeta: Record<TimelineKind, { icon: typeof Flag; chip: string; label: string }> = {
  milestone: { icon: Flag, chip: 'bg-lav-50 text-lav-600', label: 'Milestone' },
  document: { icon: FileText, chip: 'bg-teal-50 text-teal-700', label: 'Document' },
  decision: { icon: Scale, chip: 'bg-amber-50 text-amber-600', label: 'Decision' },
  service: { icon: HeartHandshake, chip: 'bg-sage-50 text-sage-600', label: 'Service' },
  record: { icon: Circle, chip: 'bg-canvas text-ink-soft', label: 'Update' },
}

export default function Timeline() {
  const { state } = useFamily()
  const name = firstName(state.child.name)
  const age = getAge(state.child)
  // Newest first reads best as a "how far we've come" scroll.
  const events = useMemo(() => buildTimeline(state).reverse(), [state])

  const counts = events.reduce<Record<string, number>>((acc, e) => {
    acc[e.kind] = (acc[e.kind] ?? 0) + 1
    return acc
  }, {})

  return (
    <div className="space-y-7">
      <PageHeader
        eyebrow="The road already walked"
        title="Family Timeline"
        subtitle={`Every milestone, document, and decision in ${name}’s journey — one living history you never have to reconstruct from memory.`}
        icon={<History className="h-6 w-6" />}
      />

      {events.length <= 1 ? (
        <div className="card">
          <EmptyState
            icon={<History className="h-6 w-6" />}
            title="Your history starts here"
            body={`As you complete steps, add documents, and make decisions, they’ll gather here into ${name}’s living record. The road is just beginning.`}
            action={
              <Link to="/" className="btn-primary">
                Start with your briefing <ArrowRight className="h-4 w-4" />
              </Link>
            }
          />
        </div>
      ) : (
        <>
          <AiNote title="How far you’ve come">
            {name}’s record holds {events.length} moments across {age > 0 ? `${age} years` : 'the journey so far'}
            {counts.milestone ? ` — ${counts.milestone} ${counts.milestone === 1 ? 'milestone' : 'milestones'}` : ''}
            {counts.document ? `, ${counts.document} ${counts.document === 1 ? 'document' : 'documents'}` : ''}
            {counts.decision ? `, ${counts.decision} recorded ${counts.decision === 1 ? 'decision' : 'decisions'}` : ''}
            . When a meeting or agency asks “how did we get here?”, this is the answer — already written.
          </AiNote>

          <div className="relative">
            <div className="absolute left-[19px] top-2 bottom-2 w-0.5 bg-line" aria-hidden />
            <ul className="space-y-4">
              {events.map((e) => {
                const meta = kindMeta[e.kind]
                const Icon = meta.icon
                return (
                  <li key={e.id} className="relative pl-12">
                    <span
                      className={cx(
                        'absolute left-0 top-1 flex h-10 w-10 items-center justify-center rounded-full ring-4 ring-canvas',
                        meta.chip,
                      )}
                    >
                      <Icon className="h-4 w-4" />
                    </span>
                    <div className="card p-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={cx('chip', meta.chip)}>{meta.label}</span>
                        <span className="text-xs font-semibold text-ink-faint">{e.dateLabel}</span>
                      </div>
                      <h3 className="mt-2 font-semibold leading-snug text-ink">{e.title}</h3>
                      {e.detail && <p className="mt-1 text-sm leading-relaxed text-ink-soft">{e.detail}</p>}
                    </div>
                  </li>
                )
              })}
            </ul>
          </div>
        </>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-canvas px-5 py-4">
        <p className="text-sm text-ink-soft">The road ahead is mapped too — see what’s coming next.</p>
        <Link to="/look-ahead" className="btn-ghost">
          <Telescope className="h-4 w-4" /> Look Ahead
        </Link>
      </div>
    </div>
  )
}
