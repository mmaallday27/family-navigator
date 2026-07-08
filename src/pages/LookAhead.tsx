// Look Ahead — the unknown, made visible. The road forward across five
// horizons (30 days → 5 years), projected from the child's real birthday, the
// family's open preparation steps, and known deadlines. A defining experience:
// families should always understand what is approaching.

import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Telescope,
  ArrowRight,
  Scale,
  GraduationCap,
  Landmark,
  ClipboardCheck,
  Sparkles,
  CalendarHeart,
  AlertCircle,
} from 'lucide-react'
import { PageHeader } from '../components/ui'
import { AiNote } from '../components/ai'
import { useFamily } from '../store/FamilyContext'
import { firstName } from '../store/selectors'
import { buildLookAhead, type HorizonKind } from '../intelligence/lookahead'
import { cx } from '../lib/cx'

const kindMeta: Record<HorizonKind, { icon: typeof Scale; chip: string; dot: string; label: string }> = {
  legal: { icon: Scale, chip: 'bg-rose-50 text-rose-500', dot: 'bg-rose-400', label: 'Legal milestone' },
  school: { icon: GraduationCap, chip: 'bg-sage-50 text-sage-600', dot: 'bg-sage-500', label: 'School' },
  benefits: { icon: Landmark, chip: 'bg-teal-50 text-teal-700', dot: 'bg-teal-500', label: 'Benefits' },
  preparation: { icon: ClipboardCheck, chip: 'bg-amber-50 text-amber-600', dot: 'bg-amber-400', label: 'Preparation' },
  opportunity: { icon: Sparkles, chip: 'bg-lav-50 text-lav-600', dot: 'bg-lav-500', label: 'Opportunity' },
  family: { icon: CalendarHeart, chip: 'bg-amber-50 text-amber-600', dot: 'bg-amber-300', label: 'Family moment' },
}

export default function LookAhead() {
  const { state } = useFamily()
  const name = firstName(state.child.name)
  const horizons = useMemo(() => buildLookAhead(state), [state])
  const populated = horizons.filter((h) => h.events.length > 0)
  const [activeId, setActiveId] = useState<string>(populated[0]?.id ?? '30d')
  const active = horizons.find((h) => h.id === activeId) ?? horizons[0]

  const totalAhead = horizons.reduce((n, h) => n + h.events.length, 0)
  const startNowCount = horizons.flatMap((h) => h.events).filter((e) => e.startNow).length

  return (
    <div className="space-y-7">
      <PageHeader
        eyebrow="The road forward"
        title="Look Ahead"
        subtitle={`Everything approaching for ${name}, from the next month to the next five years. The unknown becomes visible — so nothing important arrives as a surprise.`}
        icon={<Telescope className="h-6 w-6" />}
      />

      <AiNote title="What I’m watching for you">
        I mapped {totalAhead} {totalAhead === 1 ? 'milestone' : 'things'} ahead for {name} from{' '}
        {name === 'your child' ? 'the' : `${name}’s`} birthday, your open preparation steps, and
        known deadlines.{' '}
        {startNowCount > 0 ? (
          <>
            {startNowCount === 1 ? 'One is' : `${startNowCount} are`} marked{' '}
            <span className="font-semibold text-ink">Start now</span> — the ideal window has arrived,
            and most families wish they’d begun these earlier.
          </>
        ) : (
          <>Nothing is overdue — you’re ahead of the road, which is exactly where this works best.</>
        )}
      </AiNote>

      {/* Horizon selector */}
      <div className="flex flex-wrap gap-2">
        {horizons.map((h) => {
          const isActive = h.id === active?.id
          const empty = h.events.length === 0
          return (
            <button
              key={h.id}
              onClick={() => setActiveId(h.id)}
              disabled={empty}
              aria-pressed={isActive}
              className={cx(
                'rounded-2xl border px-4 py-2.5 text-left transition-colors',
                isActive
                  ? 'border-teal-300 bg-teal-50'
                  : empty
                    ? 'cursor-not-allowed border-line bg-surface opacity-50'
                    : 'border-line bg-surface hover:bg-canvas',
              )}
            >
              <span className={cx('block text-sm font-semibold', isActive ? 'text-teal-700' : 'text-ink')}>
                {h.label}
              </span>
              <span className="block text-xs text-ink-faint">
                {h.events.length > 0 ? `${h.events.length} ${h.events.length === 1 ? 'item' : 'items'}` : 'Clear'}
              </span>
            </button>
          )
        })}
      </div>

      {/* Active horizon */}
      {active && (
        <section>
          <div className="mb-4 flex items-baseline justify-between">
            <h2 className="section-title text-xl font-semibold">{active.label}</h2>
            <span className="text-sm text-ink-faint">{active.sub}</span>
          </div>

          {active.events.length === 0 ? (
            <div className="card p-8 text-center text-ink-soft">
              Nothing scheduled in this window. Quiet stretches are part of the road too.
            </div>
          ) : (
            <div className="relative">
              <div className="absolute left-[19px] top-2 bottom-2 w-0.5 bg-line" aria-hidden />
              <ul className="space-y-4">
                {active.events.map((e) => {
                  const meta = kindMeta[e.kind]
                  const Icon = meta.icon
                  return (
                    <li key={e.id} className="relative pl-12">
                      <span
                        className={cx(
                          'absolute left-0 top-1 flex h-10 w-10 items-center justify-center rounded-full ring-4 ring-canvas',
                          e.startNow ? 'bg-amber-100 text-amber-600' : cx(meta.chip),
                        )}
                      >
                        {e.startNow ? <AlertCircle className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                      </span>
                      <Link
                        to={e.to}
                        className="card card-hover block p-4"
                      >
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={cx('chip', meta.chip)}>{meta.label}</span>
                          <span
                            className={cx(
                              'text-xs font-semibold',
                              e.startNow ? 'text-amber-600' : 'text-ink-faint',
                            )}
                          >
                            {e.dateLabel}
                          </span>
                        </div>
                        <h3 className="mt-2 font-semibold leading-snug text-ink">{e.title}</h3>
                        {e.detail && <p className="mt-1 text-sm leading-relaxed text-ink-soft">{e.detail}</p>}
                        <span className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-teal-600">
                          Go there <ArrowRight className="h-3.5 w-3.5" />
                        </span>
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </div>
          )}
        </section>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-canvas px-5 py-4">
        <p className="text-sm text-ink-soft">
          Want the road already walked, too? The timeline shows how far you’ve come.
        </p>
        <Link to="/timeline" className="btn-ghost">
          Open the Family Timeline <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <p className="rounded-xl bg-canvas px-4 py-3 text-xs leading-relaxed text-ink-faint">
        Dates are projected from {name}’s birthday and typical timelines — always confirm exact
        deadlines against official letters and your school’s calendar.
      </p>
    </div>
  )
}
