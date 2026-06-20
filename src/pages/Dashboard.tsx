import { Link } from 'react-router-dom'
import {
  CalendarClock,
  Target,
  ArrowRight,
  Sparkles,
  AlertCircle,
  Clock,
  ChevronRight,
  Heart,
} from 'lucide-react'
import { Card, ProgressBar, ProgressRing } from '../components/ui'
import {
  child,
  parent,
  activeGoals,
  upcomingDeadlines,
  recommendedActions,
  stageProgress,
} from '../data/profile'
import { journeyStages } from '../data/journey'
import { cx } from '../lib/cx'

const categoryColor: Record<string, string> = {
  School: 'bg-sage-50 text-sage-600',
  'Adult services': 'bg-teal-50 text-teal-700',
  Legal: 'bg-rose-50 text-rose-500',
  Employment: 'bg-amber-50 text-amber-600',
}

export default function Dashboard() {
  const activeStage = journeyStages.find((s) => s.id === child.currentStageId)!
  const overall = Math.round(
    Object.values(stageProgress).reduce((a, b) => a + b, 0) / Object.values(stageProgress).length,
  )

  return (
    <div className="space-y-7">
      {/* Warm welcome / hero */}
      <section className="overflow-hidden rounded-3xl bg-gradient-to-br from-teal-600 to-teal-500 text-white shadow-lift">
        <div className="grid gap-6 p-7 sm:p-9 md:grid-cols-[1fr_auto] md:items-center">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-medium">
              <Heart className="h-3.5 w-3.5" /> Good to see you, {parent.name.split(' ')[0]}
            </div>
            <h1 className="font-display text-2xl font-semibold leading-snug sm:text-3xl">
              You’re guiding {child.name.split(' ')[0]} through{' '}
              <span className="text-amber-200">{child.currentStageLabel}</span>.
            </h1>
            <p className="mt-3 max-w-xl text-teal-50">
              Here’s where things stand today — what’s coming up, and the few next steps that matter
              most. One step at a time.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link to="/transition" className="btn bg-white text-teal-700 hover:bg-teal-50">
                Continue transition planning <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/companion" className="btn bg-teal-400/40 text-white hover:bg-teal-400/60">
                Ask the AI Companion
              </Link>
            </div>
          </div>
          <div className="flex items-center gap-5 rounded-2xl bg-white/10 p-5">
            <ProgressRing value={overall} size={92} stroke={9} accent="#FAE6C9" label={
              <span className="text-base font-semibold text-white">{overall}%</span>
            } />
            <div className="text-sm leading-tight">
              <p className="font-semibold">Journey mapped</p>
              <p className="text-teal-50">Across all 6 life stages</p>
              <Link to="/journey" className="mt-2 inline-flex items-center gap-1 text-amber-200 hover:text-white">
                View the map <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Child profile + current stage */}
      <div className="grid gap-5 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <div className="flex items-start gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-teal-100 text-xl font-semibold text-teal-700">
              {child.name.split(' ').map((n) => n[0]).join('')}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <h2 className="section-title text-xl font-semibold">{child.name}</h2>
                <span className="text-sm text-ink-faint">{child.pronouns} · age {child.age} · {child.schoolGrade}</span>
              </div>
              <p className="mt-1 text-sm text-ink-soft">{child.diagnosis} · diagnosed {child.diagnosedAt}</p>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-ink-faint">Strengths</p>
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {child.strengths.map((s) => (
                      <span key={s} className="chip bg-sage-50 text-sage-600">{s}</span>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-ink-faint">Interests</p>
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {child.interests.map((s) => (
                      <span key={s} className="chip bg-amber-50 text-amber-600">{s}</span>
                    ))}
                  </div>
                </div>
              </div>
              <p className="mt-3 text-sm text-ink-soft">
                <span className="font-medium text-ink">Communication:</span> {child.communication}
              </p>
            </div>
          </div>
        </Card>

        {/* Current stage card */}
        <Card className="flex flex-col bg-gradient-to-br from-lav-50 to-surface">
          <div className="flex items-center gap-2 text-lav-600">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-lav-100 text-xs font-bold">4</span>
            <p className="text-xs font-semibold uppercase tracking-wide">Current life stage</p>
          </div>
          <h3 className="section-title mt-2 text-lg font-semibold">{activeStage.title}</h3>
          <p className="mt-1 text-sm text-ink-soft">Ages {activeStage.ageRange}</p>
          <div className="mt-4">
            <div className="mb-1.5 flex items-center justify-between text-xs">
              <span className="text-ink-faint">Stage progress</span>
              <span className="font-semibold text-lav-600">{stageProgress.transition}%</span>
            </div>
            <ProgressBar value={stageProgress.transition} accent="lav" />
          </div>
          <Link to="/transition" className="btn-ghost mt-auto pt-3 text-lav-600 hover:bg-lav-100">
            Open Transition Navigator <ArrowRight className="h-4 w-4" />
          </Link>
        </Card>
      </div>

      {/* Recommended next actions */}
      <section>
        <div className="mb-3 flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-amber-500" />
          <h2 className="section-title text-lg font-semibold">Recommended next steps</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {recommendedActions.map((a) => (
            <Link key={a.id} to={a.to} className="card card-hover group flex flex-col p-5">
              <div className="flex items-center justify-between">
                <span className="chip bg-teal-50 text-teal-700">{a.module}</span>
                <span className="inline-flex items-center gap-1 text-xs text-ink-faint">
                  <Clock className="h-3.5 w-3.5" /> {a.minutes} min
                </span>
              </div>
              <h3 className="mt-3 font-semibold text-ink">{a.title}</h3>
              <p className="mt-1.5 flex-1 text-sm text-ink-soft">{a.why}</p>
              <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-teal-600 group-hover:gap-2">
                Start <ArrowRight className="h-4 w-4 transition-all" />
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Goals + deadlines */}
      <div className="grid gap-5 lg:grid-cols-2">
        {/* Active goals */}
        <Card>
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-teal-600" />
              <h2 className="section-title text-lg font-semibold">Active goals</h2>
            </div>
            <span className="text-xs text-ink-faint">{activeGoals.length} in progress</span>
          </div>
          <ul className="space-y-4">
            {activeGoals.map((g) => (
              <li key={g.id}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium text-ink">{g.title}</p>
                    <p className="text-xs text-ink-faint">{g.area} · {g.owner}</p>
                  </div>
                  <span className="chip shrink-0 bg-canvas text-ink-soft">Due {g.due}</span>
                </div>
                <div className="mt-2 flex items-center gap-3">
                  <ProgressBar value={g.progress} />
                  <span className="w-9 text-right text-xs font-semibold text-ink-soft">{g.progress}%</span>
                </div>
              </li>
            ))}
          </ul>
        </Card>

        {/* Upcoming deadlines */}
        <Card>
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CalendarClock className="h-5 w-5 text-teal-600" />
              <h2 className="section-title text-lg font-semibold">Upcoming milestones</h2>
            </div>
            <span className="text-xs text-ink-faint">Next 12 months</span>
          </div>
          <ul className="space-y-3">
            {upcomingDeadlines.map((d) => (
              <li
                key={d.id}
                className={cx(
                  'flex items-start gap-3 rounded-xl border p-3',
                  d.urgent ? 'border-amber-200 bg-amber-50/50' : 'border-line',
                )}
              >
                <div
                  className={cx(
                    'mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg',
                    d.urgent ? 'bg-amber-100 text-amber-600' : 'bg-canvas text-ink-faint',
                  )}
                >
                  {d.urgent ? <AlertCircle className="h-4 w-4" /> : <CalendarClock className="h-4 w-4" />}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium leading-snug text-ink">{d.title}</p>
                  <div className="mt-1 flex flex-wrap items-center gap-2">
                    <span className={cx('chip', categoryColor[d.category] ?? 'bg-canvas text-ink-soft')}>
                      {d.category}
                    </span>
                    <span className="text-xs text-ink-faint">{d.date}</span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  )
}
