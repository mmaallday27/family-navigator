// Home base, rebuilt around the Family Executive Briefing: every time the
// family opens the platform, the navigator has already read the whole record
// and answers — what matters this week, how long it will take, what's new,
// and what to watch. Every line is derived from live state.

import { useState } from 'react'
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
  MapPin,
  Pencil,
  Plus,
  Telescope,
} from 'lucide-react'
import { Card, EmptyState, Modal, ProgressBar, ProgressRing } from '../components/ui'
import { AiInsightCard } from '../components/ai'
import { useFamily, type ChildProfile, type FamilyLocation } from '../store/FamilyContext'
import {
  birthYearOptions,
  currentStageProgress,
  firstName,
  getAge,
  initials,
  keyMoments,
  locationLabel,
  monthOptions,
  roughlyLabel,
  stageIdForAge,
} from '../store/selectors'
import { supportedStates } from '../data/stateRegistry'
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

const fieldClass =
  'mt-1.5 w-full rounded-xl border border-line bg-surface px-4 py-2.5 text-sm text-ink placeholder:text-ink-faint focus:border-teal-300'

/** Fix a typo in the name, birthday, diagnosis, communication, or where the
 *  family lives — the small edits onboarding promised would always be possible
 *  later. */
function EditChildForm({
  child,
  location,
  onSave,
  onCancel,
}: {
  child: ChildProfile
  location: FamilyLocation
  onSave: (patch: Partial<ChildProfile>, location: FamilyLocation) => void
  onCancel: () => void
}) {
  const [birthYear0, birthMonth0, birthDay0] = child.birthDate.split('-')
  const [name, setName] = useState(child.name)
  const [birthMonth, setBirthMonth] = useState(Number(birthMonth0) || 1)
  const [birthYear, setBirthYear] = useState(Number(birthYear0) || new Date().getFullYear())
  const [diagnosis, setDiagnosis] = useState(child.diagnosis)
  const [communication, setCommunication] = useState(child.communication)
  const [locState, setLocState] = useState(location.state)
  const [county, setCounty] = useState(location.county)
  const [zip, setZip] = useState(location.zip)

  const save = () => {
    if (!name.trim()) return
    // Keep the exact day when the month & year are unchanged; otherwise anchor
    // the new month to the 1st, same as onboarding.
    const unchanged = Number(birthYear0) === birthYear && Number(birthMonth0) === birthMonth
    const day = unchanged && birthDay0 ? birthDay0 : '01'
    onSave(
      {
        name: name.trim(),
        birthDate: `${birthYear}-${String(birthMonth).padStart(2, '0')}-${day}`,
        diagnosis: diagnosis.trim(),
        communication: communication.trim(),
      },
      {
        state: locState,
        county: locState ? county.trim() : '',
        zip: locState ? zip.trim() : '',
      },
    )
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        save()
      }}
      className="mt-4 space-y-4"
    >
      <label className="block">
        <span className="text-xs font-semibold uppercase tracking-wide text-ink-faint">First name</span>
        <input value={name} onChange={(e) => setName(e.target.value)} className={fieldClass} />
      </label>
      <div>
        <span className="text-xs font-semibold uppercase tracking-wide text-ink-faint">When they were born</span>
        <div className="mt-1.5 flex gap-2">
          <select
            value={birthMonth}
            onChange={(e) => setBirthMonth(Number(e.target.value))}
            aria-label="Birth month"
            className="min-w-0 flex-1 rounded-xl border border-line bg-surface px-3 py-2.5 text-sm text-ink focus:border-teal-300"
          >
            {monthOptions.map((m, i) => (
              <option key={m} value={i + 1}>
                {m}
              </option>
            ))}
          </select>
          <select
            value={birthYear}
            onChange={(e) => setBirthYear(Number(e.target.value))}
            aria-label="Birth year"
            className="w-28 rounded-xl border border-line bg-surface px-3 py-2.5 text-sm text-ink focus:border-teal-300"
          >
            {birthYearOptions().map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>
        <p className="mt-1.5 text-xs text-ink-faint">
          Every projected legal date — 14, 18, 22 — is derived from this.
        </p>
      </div>
      <label className="block">
        <span className="text-xs font-semibold uppercase tracking-wide text-ink-faint">Diagnosis</span>
        <input
          value={diagnosis}
          onChange={(e) => setDiagnosis(e.target.value)}
          placeholder="Leave blank if you’re still exploring"
          className={fieldClass}
        />
      </label>
      <label className="block">
        <span className="text-xs font-semibold uppercase tracking-wide text-ink-faint">Communication</span>
        <input
          value={communication}
          onChange={(e) => setCommunication(e.target.value)}
          placeholder="e.g. Speaks in full sentences; writes to organize thoughts"
          className={fieldClass}
        />
      </label>
      <div>
        <span className="text-xs font-semibold uppercase tracking-wide text-ink-faint">Where you live</span>
        <div className="mt-1.5 flex flex-col gap-2 sm:flex-row">
          <select
            value={locState}
            onChange={(e) => setLocState(e.target.value)}
            aria-label="State"
            className="min-w-0 flex-1 rounded-xl border border-line bg-surface px-3 py-2.5 text-sm text-ink focus:border-teal-300"
          >
            <option value="">Prefer not to say</option>
            {supportedStates.map((s) => (
              <option key={s.code} value={s.code}>
                {s.name}
              </option>
            ))}
          </select>
          {locState !== '' && (
            <>
              <input
                value={county}
                onChange={(e) => setCounty(e.target.value)}
                placeholder="County"
                aria-label="County"
                className="min-w-0 flex-1 rounded-xl border border-line bg-surface px-4 py-2.5 text-sm text-ink placeholder:text-ink-faint focus:border-teal-300"
              />
              <input
                value={zip}
                onChange={(e) => setZip(e.target.value)}
                placeholder="ZIP (optional)"
                aria-label="ZIP code"
                inputMode="numeric"
                className="w-full rounded-xl border border-line bg-surface px-4 py-2.5 text-sm text-ink placeholder:text-ink-faint focus:border-teal-300 sm:w-28"
              />
            </>
          )}
        </div>
        <p className="mt-1.5 text-xs text-ink-faint">
          Optional — services and deadlines differ by state and county, so this grounds your
          guidance in your state’s actual system.
        </p>
      </div>
      <div className="flex items-center justify-end gap-2 pt-1">
        <button type="button" onClick={onCancel} className="btn-soft">
          Cancel
        </button>
        <button type="submit" disabled={!name.trim()} className="btn-primary">
          Save changes
        </button>
      </div>
    </form>
  )
}

export default function Dashboard() {
  const { state, dispatch } = useFamily()
  const { child, goals, parent } = state
  const [editingChild, setEditingChild] = useState(false)
  const [addingGoal, setAddingGoal] = useState(false)
  const [goalTitle, setGoalTitle] = useState('')
  const [goalArea, setGoalArea] = useState('')
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
  const locLabel = locationLabel(state.location)

  // Acknowledge time away — the product should feel alive on return.
  const days = briefing.daysSinceLastVisit
  const welcomeBack =
    days !== null && days >= 7
      ? `Welcome back — it’s been ${roughlyLabel(days)}. I’ve kept everything current while you were away; here’s where things stand now.`
      : null

  const addGoal = () => {
    const title = goalTitle.trim()
    if (!title) return
    dispatch({
      type: 'add-goal',
      goal: {
        id: crypto.randomUUID(),
        title,
        area: goalArea.trim() || 'Family',
        due: 'This year',
        progress: 0,
        owner: firstName(parent.name) || 'You',
      },
    })
    setGoalTitle('')
    setGoalArea('')
    setAddingGoal(false)
  }

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

          <p className="mt-4 text-[11px] leading-relaxed text-white/90">
            Derived from your family record. Always verify dates against official letters — and
            bring legal, medical, and benefits decisions to a qualified professional.
          </p>
        </div>
      </section>

      {/* Child profile + current stage */}
      <div className="grid gap-5 lg:grid-cols-3">
        {/* Not <Card>: mobile trims the padding to 16px (p-4) to reclaim width,
            while desktop keeps the roomier p-5. A 3-column grid puts avatar /
            identity / Edit in a compact header row, then lets the profile content
            span the full card width on phones (col-span-3) yet sit beside the
            avatar on tablet/desktop (sm:col-start-2) — preserving the wide layout. */}
        <div className="card p-4 sm:p-5 lg:col-span-2">
          <div className="grid grid-cols-[auto_1fr_auto] items-start gap-x-3 gap-y-3 sm:gap-x-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-teal-100 text-lg font-semibold text-teal-700 sm:h-16 sm:w-16 sm:text-xl">
              {initials(child.name)}
            </div>

            {/* Identity — name, age, grade. min-w-0 lets the name wrap/truncate
                instead of shoving the Edit control off the row. */}
            <div className="min-w-0 self-center sm:self-start">
              <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                <h2 className="section-title min-w-0 break-words text-lg font-semibold sm:text-xl">{child.name}</h2>
                <span className="text-sm text-ink-faint">
                  {[`age ${age}`, child.schoolGrade].filter(Boolean).join(' · ')}
                </span>
                {/* Location rides in the header on desktop only; on mobile it moves
                    into the full-width content below (see sm:hidden copy). */}
                {locLabel && (
                  <span className="hidden items-center gap-1 text-sm text-ink-faint sm:inline-flex">
                    <MapPin className="h-3.5 w-3.5" /> {locLabel}
                  </span>
                )}
              </div>
            </div>

            {/* Edit lives in its own grid column, so it can never collide with the name. */}
            <button
              onClick={() => setEditingChild(true)}
              className="btn-ghost -mr-1 shrink-0 whitespace-nowrap text-ink-faint hover:text-ink-soft"
              aria-label={`Edit ${childFirst}’s profile`}
            >
              <Pencil className="h-3.5 w-3.5" /> Edit
            </button>

            {/* Full-width content on mobile; indented beside the avatar on desktop. */}
            <div className="col-span-3 min-w-0 sm:col-span-2 sm:col-start-2">
              {locLabel && (
                <p className="flex items-center gap-1 text-sm text-ink-faint sm:hidden">
                  <MapPin className="h-3.5 w-3.5 shrink-0" /> {locLabel}
                </p>
              )}
              {child.diagnosis && (
                <p className="mt-1 text-sm text-ink-soft">
                  {child.diagnosis}
                  {child.diagnosedAt && ` · diagnosed ${child.diagnosedAt}`}
                </p>
              )}
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-ink-faint">Strengths</p>
                  {/* Two tags per row on normal phones (repeat(2, minmax(0,1fr))),
                      one column under ~360px, natural flex-wrap on desktop. */}
                  <div className="mt-1.5 grid grid-cols-1 gap-1.5 min-[360px]:grid-cols-2 sm:flex sm:flex-wrap">
                    {child.strengths.length > 0 ? (
                      child.strengths.map((s) => (
                        <span
                          key={s}
                          className="chip w-full min-w-0 justify-start whitespace-normal break-words bg-sage-50 text-left text-sage-600 sm:w-auto"
                        >
                          {s}
                        </span>
                      ))
                    ) : (
                      <span className="col-span-full text-xs text-ink-faint">Add strengths as you notice them — they lead the planning here.</span>
                    )}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-ink-faint">Interests</p>
                  <div className="mt-1.5 grid grid-cols-1 gap-1.5 min-[360px]:grid-cols-2 sm:flex sm:flex-wrap">
                    {child.interests.length > 0 ? (
                      child.interests.map((s) => (
                        <span
                          key={s}
                          className="chip w-full min-w-0 justify-start whitespace-normal break-words bg-amber-50 text-left text-amber-600 sm:w-auto"
                        >
                          {s}
                        </span>
                      ))
                    ) : (
                      <span className="col-span-full text-xs text-ink-faint">What does {childFirst} love? Interests point toward the future.</span>
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
        </div>

        <Modal
          open={editingChild}
          onClose={() => setEditingChild(false)}
          title={`${childFirst}’s profile`}
        >
          <EditChildForm
            child={child}
            location={state.location}
            onCancel={() => setEditingChild(false)}
            onSave={(patch, location) => {
              dispatch({ type: 'update-child', child: patch })
              if (
                location.state !== state.location.state ||
                location.county !== state.location.county ||
                location.zip !== state.location.zip
              ) {
                dispatch({ type: 'set-location', location })
              }
              setEditingChild(false)
            }}
          />
        </Modal>

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
            <span className="text-xs text-ink-faint">
              {goals.filter((g) => g.progress < 100).length} in progress
            </span>
          </div>
          {goals.length === 0 ? (
            <EmptyState
              icon={<Target className="h-5 w-5" />}
              title="No goals yet"
              body="Goals grow out of the journey — start with a priority from your briefing, or ask the navigator where to begin."
            />
          ) : (
            <ul className="space-y-4">
              {goals.map((g) => {
                const done = g.progress >= 100
                return (
                  <li key={g.id}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className={cx('font-medium', done ? 'text-ink-faint' : 'text-ink')}>
                          {done && <Check className="mr-1 inline h-4 w-4 text-sage-500" aria-label="Completed" />}
                          {g.title}
                        </p>
                        <p className="text-xs text-ink-faint">{g.area} · {g.owner}</p>
                      </div>
                      <span className={cx('chip shrink-0', done ? 'bg-sage-50 text-sage-600' : 'bg-canvas text-ink-soft')}>
                        {done ? 'Done' : `Due ${g.due}`}
                      </span>
                    </div>
                    <div className="mt-2 flex items-center gap-3">
                      <ProgressBar value={g.progress} accent={done ? 'sage' : 'teal'} label={`Progress on ${g.title}`} />
                      <span className="w-9 text-right text-xs font-semibold text-ink-soft">{g.progress}%</span>
                    </div>
                    <div className="mt-1.5 flex items-center gap-4 text-xs">
                      {!done && (
                        <button
                          onClick={() => dispatch({ type: 'set-goal-progress', id: g.id, progress: 100 })}
                          className="font-medium text-teal-600 hover:underline"
                        >
                          Mark complete
                        </button>
                      )}
                      <button
                        onClick={() => dispatch({ type: 'remove-goal', id: g.id })}
                        className="text-ink-faint hover:text-rose-500"
                        aria-label={`Remove the goal “${g.title}”`}
                      >
                        Remove
                      </button>
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
          {addingGoal ? (
            <form
              onSubmit={(e) => {
                e.preventDefault()
                addGoal()
              }}
              className="mt-4 space-y-2 rounded-xl bg-canvas p-3"
            >
              <input
                value={goalTitle}
                onChange={(e) => setGoalTitle(e.target.value)}
                placeholder="What are you working toward?"
                aria-label="Goal title"
                autoFocus
                className="w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink placeholder:text-ink-faint focus:border-teal-300"
              />
              <input
                value={goalArea}
                onChange={(e) => setGoalArea(e.target.value)}
                placeholder="Area — e.g. School, Benefits, Independent living"
                aria-label="Goal area"
                className="w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink placeholder:text-ink-faint focus:border-teal-300"
              />
              <div className="flex items-center gap-2 pt-1">
                <button type="submit" disabled={!goalTitle.trim()} className="btn-primary px-3 py-1.5 text-xs">
                  Add goal
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAddingGoal(false)
                    setGoalTitle('')
                    setGoalArea('')
                  }}
                  className="btn-soft px-3 py-1.5 text-xs"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <button
              onClick={() => setAddingGoal(true)}
              className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-teal-600 hover:underline"
            >
              <Plus className="h-4 w-4" /> Add a goal
            </button>
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
