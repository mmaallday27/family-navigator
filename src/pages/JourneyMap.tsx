import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Map,
  Check,
  MapPin,
  Circle,
  HelpCircle,
  FileText,
  Flag,
  ArrowRight,
  Lightbulb,
  Infinity as InfinityIcon,
} from 'lucide-react'
import { PageHeader } from '../components/ui'
import { AiNote } from '../components/ai'
import { journeyStages, type StageStatus } from '../data/journey'
import { useFamily } from '../store/FamilyContext'
import { firstName, getAge, stageIdForAge, stageStatus } from '../store/selectors'
import { nextMilestone } from '../intelligence/insights'
import { cx } from '../lib/cx'

function StatusDot({ status, lifelong }: { status: StageStatus; lifelong?: boolean }) {
  if (lifelong)
    return (
      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-surface text-amber-500 ring-4 ring-amber-50 border border-amber-200">
        <InfinityIcon className="h-4 w-4" />
      </span>
    )
  if (status === 'complete')
    return (
      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-teal-500 text-white ring-4 ring-teal-100">
        <Check className="h-4 w-4" />
      </span>
    )
  if (status === 'active')
    return (
      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-lav-500 text-white ring-4 ring-lav-100 animate-pulse-soft">
        <MapPin className="h-4 w-4" />
      </span>
    )
  return (
    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-surface text-ink-faint ring-4 ring-canvas border border-line">
      <Circle className="h-3 w-3" />
    </span>
  )
}

const statusLabel: Record<StageStatus, string> = {
  complete: 'Behind you',
  active: 'You are here',
  upcoming: 'Ahead',
}

const statusChip: Record<StageStatus, string> = {
  complete: 'bg-teal-50 text-teal-700',
  active: 'bg-lav-100 text-lav-600',
  upcoming: 'bg-canvas text-ink-faint',
}

function DetailColumn({
  icon,
  title,
  items,
}: {
  icon: React.ReactNode
  title: string
  items: string[]
}) {
  return (
    <div>
      <div className="mb-2 flex items-center gap-2 text-ink-soft">
        {icon}
        <p className="text-xs font-semibold uppercase tracking-wide">{title}</p>
      </div>
      <ul className="space-y-1.5">
        {items.map((it) => (
          <li key={it} className="flex gap-2 text-sm text-ink-soft">
            <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-teal-300" />
            {it}
          </li>
        ))}
      </ul>
    </div>
  )
}

export default function JourneyMap() {
  const { state } = useFamily()
  const age = getAge(state.child)
  const currentStageId = stageIdForAge(age)
  const [openId, setOpenId] = useState<string>(currentStageId)

  return (
    <div className="space-y-7">
      <PageHeader
        eyebrow="The whole road, in one view"
        title="Development Journey Map"
        subtitle={`Six stages, from first questions to lifelong planning. You can see where ${firstName(state.child.name)} has been, where you are, and what’s ahead — so the path never feels invisible.`}
        icon={<Map className="h-6 w-6" />}
      />

      {/* Contextual intelligence: the next milestone on the road */}
      <AiNote title="Next milestone on the road">{nextMilestone(state)}</AiNote>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-sm">
        {(['complete', 'active', 'upcoming'] as const).map((s) => (
          <div key={s} className="flex items-center gap-2">
            <span className={cx('h-3 w-3 rounded-full', s === 'complete' ? 'bg-teal-500' : s === 'active' ? 'bg-lav-500' : 'border border-line bg-surface')} />
            <span className="text-ink-soft">{statusLabel[s]}</span>
          </div>
        ))}
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full border border-amber-300 bg-amber-50" />
          <span className="text-ink-soft">Lifelong — runs alongside</span>
        </div>
      </div>

      {/* Timeline */}
      <div className="relative">
        {/* vertical connector */}
        <div className="absolute left-[18px] top-2 bottom-2 w-0.5 bg-line" aria-hidden />
        <div className="space-y-4">
          {journeyStages.map((stage) => {
            const open = openId === stage.id
            const lifelong = stage.id === 'legacy'
            const status = stageStatus(stage.id, currentStageId)
            return (
              <div key={stage.id} className="relative pl-12">
                <div className="absolute left-0 top-3">
                  <StatusDot status={status} lifelong={lifelong} />
                </div>

                <div
                  className={cx(
                    'card overflow-hidden transition-all',
                    status === 'active' && 'ring-2 ring-lav-200',
                  )}
                >
                  {/* Header row (clickable) */}
                  <button
                    onClick={() => setOpenId(open ? '' : stage.id)}
                    aria-expanded={open}
                    className="flex w-full items-center gap-4 p-5 text-left hover:bg-canvas/60"
                  >
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-semibold text-ink-faint">Stage {stage.index}</span>
                        <span className={cx('chip', lifelong ? 'bg-amber-50 text-amber-600' : statusChip[status])}>
                          {lifelong ? 'Start anytime' : statusLabel[status]}
                        </span>
                        <span className="text-xs text-ink-faint">Ages {stage.ageRange}</span>
                      </div>
                      <h3 className="section-title mt-1 text-lg font-semibold">{stage.title}</h3>
                      <p className="text-sm text-ink-soft">{stage.tagline}</p>
                    </div>
                    <ArrowRight
                      className={cx(
                        'h-5 w-5 shrink-0 text-ink-faint transition-transform',
                        open ? 'rotate-90' : '',
                      )}
                      aria-hidden
                    />
                  </button>

                  {/* Expanded detail */}
                  {open && (
                    <div className="animate-fade-in border-t border-line bg-canvas/40 p-5">
                      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                        <DetailColumn
                          icon={<HelpCircle className="h-4 w-4" />}
                          title="Common concerns"
                          items={stage.concerns}
                        />
                        <DetailColumn
                          icon={<Flag className="h-4 w-4" />}
                          title="Key milestones"
                          items={stage.milestones}
                        />
                        <DetailColumn
                          icon={<FileText className="h-4 w-4" />}
                          title="Common documents"
                          items={stage.documents}
                        />
                        <DetailColumn
                          icon={<HelpCircle className="h-4 w-4" />}
                          title="Questions families ask"
                          items={stage.questions}
                        />
                      </div>

                      <div className="mt-5 rounded-xl bg-surface p-4">
                        <div className="mb-2 flex items-center gap-2 text-teal-700">
                          <Lightbulb className="h-4 w-4" />
                          <p className="text-xs font-semibold uppercase tracking-wide">Suggested next steps</p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {stage.nextSteps.map((step) => (
                            <span key={step} className="chip bg-teal-50 text-teal-700">{step}</span>
                          ))}
                        </div>
                        {stage.id === 'transition' && (
                          <Link to="/transition" className="btn-primary mt-4">
                            Go deeper in the Transition Navigator <ArrowRight className="h-4 w-4" />
                          </Link>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
