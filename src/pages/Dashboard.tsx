// Home base, rebuilt around the Family Executive Briefing: every time the
// family opens the platform, the navigator has already read the whole record
// and answers — what matters this week, how long it will take, what's new,
// and what to watch. Every line is derived from live state.

import { Link } from 'react-router-dom'
import {
  CalendarClock,
  Target,
  ArrowRight,
  Sparkles,
  AlertCircle,
  Clock,
  ChevronRight,
  MessageCircleHeart,
  Check,
  History,
  Telescope,
} from 'lucide-react'
import { Card, EmptyState, ProgressBar, ProgressRing } from '../components/ui'
import { AiInsightCard } from '../components/ai'
import { useFamily } from '../store/FamilyContext'
import {
  currentStageProgress,
  firstName,
  getAge,
  initials,
  keyMoments,
  stageIdForAge,
} from '../store/selectors'
import { buildBriefing } from '../intelligence/insights'
import { journeyStages } from '../data/journey'
import { demoDeadlines } from '../data/demoFamily'
import { cx } from '../lib/cx'

const categoryColor: Record<string, string> = {
  School: 'bg-sage-50 text-sage-600',
  'Adult services': 'bg-teal-50 text-teal-700',
  Legal: 'bg-rose-50 text-rose-500',
  Employment: 'bg-amber-50 text-amber-600',
}

const kindDot: Record<string, string> = {
  risk: 'bg-rose-400',
  action: 'bg-teal-300',
  deadline: 'bg-amber-400',
  opportunity: 'bg-lav-500',
  celebration: 'bg-sage-500',
}

export default function Dashboard() {
  const { state, dispatch } = useFamily()
  const { child, goals } = state
  const age = getAge(child)
  const stageId = stageIdForAge(age)
  const activeStage = journeyStages.find((s) => s.id === stageId)!
  const progress = currentStageProgress(state, age)
  const inTransition = stageId === 'transition'
  const briefing = buildBriefing(state)
  const moments = [...keyMoments(child), ...(state.isDemo ? demoDeadlines : [])]
    .sort((a, b) => a.sort - b.sort)
    .slice(0, 4)
  const childFirst = firstName(child.name)

  // Acknowledge time away — the product should feel alive on return.
  const days = briefing.daysSinceLastVisit
  const welcomeBack =
    days !== null && days >= 7
      ? `Welcome back — it’s been ${days >= 30 ? `about ${Math.round(days / 30)} month${days >= 60 ? 's' : ''}` : `${days} days`}. I’ve kept everything current while you were away; here’s where things stand now.`
      : null

  return (
    <div className="space-y-7">
      {/* ---- The Family Executive Briefing — the Command Center ---- */}
      <section className="overflow-hidden rounded-3xl bg-gradient-to-br from-teal-600 to-teal-500 text-white shadow-lift">
        <div className="p-7 sm:p-9">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-medium">
              <Sparkles className="h-3.5 w-3.5" /> Your daily briefing
            </div>
            {briefing.priorities.length > 0 && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-200/20 px-3 py-1 text-xs font-semibold text-amber-100">
                <Clock className="h-3.5 w-3.5" /> About {briefing.totalMinutes} minutes today
              </span>
            )}
          </div>

          <h1 className="mt-4 font-display text-2xl font-semibold leading-snug sm:text-3xl">
            {briefing.greeting}
          </h1>
          <p className="mt-2 max-w-2xl text-lg text-white/95">{briefing.orientation}</p>

          {/* Welcome back — the product acknowledges time away */}
          {welcomeBack && (
            <p className="mt-3 flex items-start gap-2 text-sm text-teal-50">
              <History className="mt-0.5 h-4 w-4 shrink-0 text-amber-200" /> {welcomeBack}
            </p>
          )}

          <p className="mt-4 max-w-2xl text-sm text-teal-50">{briefing.narrative}</p>

          {/* Priorities — what deserves attention, ranked */}
          <div className="mt-4 grid gap-2.5">
            {briefing.priorities.map((p) => (
              <Link
                key={p.id}
                to={p.to}
                className="group flex items-center gap-3 rounded-2xl bg-white/10 px-4 py-3 transition-colors hover:bg-white/20"
              >
                <span className={cx('h-2 w-2 shrink-0 rounded-full', kindDot[p.kind] ?? 'bg-white/60')} />
                <span className="min-w-0 flex-1">
                  <span className="block font-medium leading-snug">{p.title}</span>
                </span>
                {p.minutes && (
                  <span className="hidden shrink-0 text-xs text-teal-100 sm:inline">{p.minutes} min</span>
                )}
                <ArrowRight className="h-4 w-4 shrink-0 text-teal-100 transition-transform group-hover:translate-x-0.5" />
              </Link>
            ))}
            {briefing.priorities.length === 0 && (
              <div className="rounded-2xl bg-white/10 px-4 py-3 text-teal-50">
                Nothing urgent right now — the road is quiet. A good day to rest, or to look ahead.
              </div>
            )}
          </div>

          {/* Wins — confidence from competence, not cheerfulness */}
          {briefing.wins.length > 0 && (
            <div className="mt-4 grid gap-1.5">
              {briefing.wins.map((w) => (
                <p key={w} className="flex items-start gap-2 text-sm text-teal-50">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-sage-200" /> {w}
                </p>
              ))}
            </div>
          )}

          {/* New since last visit */}
          {briefing.newSinceLastVisit.map((line) => (
            <p key={line} className="mt-4 flex items-start gap-2 text-sm text-amber-100">
              <Sparkles className="mt-0.5 h-4 w-4 shrink-0" /> {line}
            </p>
          ))}

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <Link to="/companion" className="btn bg-white text-teal-700 hover:bg-teal-50">
              <MessageCircleHeart className="h-4 w-4" /> Talk it through with your navigator
            </Link>
            <Link to="/look-ahead" className="btn bg-teal-400/40 text-white hover:bg-teal-400/60">
              <Telescope className="h-4 w-4" /> Look ahead
            </Link>
            {progress.total > 0 && (
              <span className="inline-flex items-center gap-2 text-sm text-teal-50">
                <ProgressRing
                  value={progress.pct}
                  size={40}
                  stroke={5}
                  accent="#FAE6C9"
                  label={<span className="text-[10px] font-semibold text-white">{progress.pct}%</span>}
                />
                {progress.done} of {progress.total} stage steps done
              </span>
            )}
          </div>

          <p className="mt-4 text-[11px] leading-relaxed text-teal-100/80">
            Derived from your family record on this device. Always verify dates against official
            letters — and bring legal, medical, and benefits decisions to a qualified professional.
          </p>
        </div>
      </section>

      {/* Child profile + current stage */}
      <div className="grid gap-5 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <div className="flex items-start gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-teal-100 text-xl font-semibold text-teal-700">
              {initials(child.name)}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <h2 className="section-title text-xl font-semibold">{child.name}</h2>
                <span className="text-sm text-ink-faint">
                  {[`age ${age}`, child.schoolGrade].filter(Boolean).join(' · ')}
                </span>
              </div>
              {child.diagnosis && (
                <p className="mt-1 text-sm text-ink-soft">
                  {child.diagnosis}
                  {child.diagnosedAt && ` · diagnosed ${child.diagnosedAt}`}
                </p>
              )}
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-ink-faint">Strengths</p>
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {child.strengths.length > 0 ? (
                      child.strengths.map((s) => (
                        <span key={s} className="chip bg-sage-50 text-sage-600">{s}</span>
                      ))
                    ) : (
                      <span className="text-xs text-ink-faint">Add strengths as you notice them — they lead the planning here.</span>
                    )}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-ink-faint">Interests</p>
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {child.interests.length > 0 ? (
                      child.interests.map((s) => (
                        <span key={s} className="chip bg-amber-50 text-amber-600">{s}</span>
                      ))
                    ) : (
                      <span className="text-xs text-ink-faint">What does {childFirst} love? Interests point toward the future.</span>
                    )}
                  </div>
                </div>
              </div>
              {child.communication && (
                <p className="mt-3 text-sm text-ink-soft">
                  <span className="font-medium text-ink">Communication:</span> {child.communication}
                </p>
              )}
            </div>
          </div>
        </Card>

        {/* Current stage card */}
        <Card className="flex flex-col bg-gradient-to-br from-lav-50 to-surface">
          <div className="flex items-center gap-2 text-lav-600">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-lav-100 text-xs font-bold">
              {activeStage.index}
            </span>
            <p className="text-xs font-semibold uppercase tracking-wide">Current life stage</p>
          </div>
          <h3 className="section-title mt-2 text-lg font-semibold">{activeStage.title}</h3>
          <p className="mt-1 text-sm text-ink-soft">Ages {activeStage.ageRange}</p>
          {progress.total > 0 && (
            <div className="mt-4">
              <div className="mb-1.5 flex items-center justify-between text-xs">
                <span className="text-ink-faint">Stage progress</span>
                <span className="font-semibold text-lav-600">{progress.pct}%</span>
              </div>
              <ProgressBar value={progress.pct} accent="lav" />
            </div>
          )}
          <Link
            to={inTransition ? '/transition' : '/journey'}
            className="btn-ghost mt-auto pt-3 text-lav-600 hover:bg-lav-100"
          >
            {inTransition ? 'Open Transition Navigator' : 'See this stage on the map'}{' '}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Card>
      </div>

      {/* Watch-outs & opportunities — proactive intelligence, dismissible */}
      {briefing.watchouts.length > 0 && (
        <section>
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-amber-500" />
              <h2 className="section-title text-lg font-semibold">Watching the road for you</h2>
            </div>
            <span className="text-xs text-ink-faint">Dismiss anything you’ve handled</span>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {briefing.watchouts.map((i) => (
              <AiInsightCard
                key={i.id}
                insight={i}
                onDismiss={(id) => dispatch({ type: 'dismiss-insight', id })}
              />
            ))}
          </div>
        </section>
      )}

      {/* Goals + moments */}
      <div className="grid gap-5 lg:grid-cols-2">
        <Card>
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-teal-600" />
              <h2 className="section-title text-lg font-semibold">Active goals</h2>
            </div>
            <span className="text-xs text-ink-faint">{goals.length} in progress</span>
          </div>
          {goals.length === 0 ? (
            <EmptyState
              icon={<Target className="h-5 w-5" />}
              title="No goals yet"
              body="Goals grow out of the journey — start with a priority from your briefing, or ask the navigator where to begin."
            />
          ) : (
            <ul className="space-y-4">
              {goals.map((g) => (
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
          )}
        </Card>

        <Card>
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CalendarClock className="h-5 w-5 text-teal-600" />
              <h2 className="section-title text-lg font-semibold">Milestones ahead</h2>
            </div>
            <span className="text-xs text-ink-faint">From {childFirst}’s birthday</span>
          </div>
          {moments.length === 0 ? (
            <EmptyState
              icon={<CalendarClock className="h-5 w-5" />}
              title="No major legal milestones ahead"
              body="We’ll surface important dates here as they approach."
            />
          ) : (
            <ul className="space-y-3">
              {moments.map((d) => (
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
                      <span className="text-xs text-ink-faint">{d.dateLabel}</span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      {/* Journey ring — the whole road stays one click away */}
      <Card className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-lav-50 text-lav-500">
            <ChevronRight className="h-5 w-5" />
          </div>
          <div>
            <p className="font-semibold text-ink">The whole road, whenever you need it</p>
            <p className="text-sm text-ink-soft">
              Six stages mapped from first questions to lifelong planning — {childFirst} is in stage{' '}
              {activeStage.index} of 6.
            </p>
          </div>
        </div>
        <Link to="/journey" className="btn-ghost">
          Open the Journey Map <ArrowRight className="h-4 w-4" />
        </Link>
      </Card>
    </div>
  )
}
