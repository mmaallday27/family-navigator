import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Compass,
  Check,
  CircleDashed,
  Info,
  Lightbulb,
  ArrowRight,
  ListChecks,
} from 'lucide-react'
import { PageHeader, Card, ProgressBar } from '../components/ui'
import { AiNote, WhyThisMatters } from '../components/ai'
import { transitionTracks } from '../data/transition'
import { useFamily } from '../store/FamilyContext'
import {
  currentTrack,
  firstName,
  getAge,
  keyMoments,
  personalize,
  trackProgress,
  transitionOverview,
} from '../store/selectors'
import { cx } from '../lib/cx'

export default function TransitionNavigator() {
  const { state, dispatch } = useFamily()
  const age = getAge(state.child)
  const focus = currentTrack(age)
  const [activeTrackId, setActiveTrackId] = useState(focus.id)

  const track = transitionTracks.find((t) => t.id === activeTrackId)!
  const progress = trackProgress(track, state.checks)
  const overview = transitionOverview(state.checks)

  const stats = [
    { label: 'Years in this stage', value: '14 → 22' },
    { label: `${state.child.name.split(' ')[0]}’s age`, value: String(age) },
    { label: 'Stage progress', value: `${overview.pct}%` },
    { label: 'Open priorities', value: String(overview.open) },
  ]

  const trackTiming = (anchorAge: number, trackId: string): string => {
    if (trackId === focus.id) return 'In focus now'
    if (age >= anchorAge) return 'Worth revisiting'
    const years = anchorAge - age
    return years === 1 ? 'About a year away' : `About ${years} years away`
  }

  return (
    <div className="space-y-7">
      <PageHeader
        eyebrow="The wedge · where we go deepest"
        title="Transition to Adulthood Navigator"
        subtitle="The stretch from 14 to 22 is the most underserved part of the journey — and the most consequential. Here it’s broken into clear, age-anchored steps you can actually act on."
        icon={<Compass className="h-6 w-6" />}
      />

      {/* Contextual intelligence: what deserves focus this month, and why */}
      <AiNote title="This month’s focus">
        {(() => {
          const name = firstName(state.child.name)
          const open = focus.checklist.filter((i) => !state.checks[i.id])
          const nextLegal = keyMoments(state.child).find((m) => m.urgent) ?? keyMoments(state.child)[0]
          if (open.length === 0) {
            return (
              <>
                The <span className="font-semibold text-ink">{focus.age}</span> track is fully
                prepared — genuinely well done. When you have a quiet moment, preview the next track
                so nothing ahead is a surprise.
              </>
            )
          }
          return (
            <>
              At {age}, the <span className="font-semibold text-ink">{focus.age} · {focus.title}</span>{' '}
              track matters most for {name}. If you only do one thing this month, make it{' '}
              <span className="font-semibold text-ink">
                “{personalize(open[0].label, state.child.name)}”
              </span>
              {open[1] && <> — then “{personalize(open[1].label, state.child.name)}”</>}.
              {nextLegal && <> Keep in view: {nextLegal.title.toLowerCase()} ({nextLegal.dateLabel}).</>}
            </>
          )
        })()}
      </AiNote>

      <WhyThisMatters
        matters="The transition years decide how adulthood actually begins. School services are a legal entitlement that ends — adult services, benefits, and legal standing all have to be arranged in advance, and each runs on its own clock."
        now={`At ${age}, ${firstName(state.child.name)} is inside this window. Waitlists, court timelines, and paperwork all take longer than expected, so early is calm and late is a scramble.`}
        connects="Every step you check here flows straight to your briefing, your Look Ahead, and the documents you’ll want in hand at the next IEP or agency meeting."
      />

      {/* Stat row — every number derived from live checklist state */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label} className="text-center">
            <p className="font-display text-2xl font-semibold text-teal-600">{s.value}</p>
            <p className="mt-1 text-xs text-ink-faint">{s.label}</p>
          </Card>
        ))}
      </div>

      {/* Track selector */}
      <div className="grid gap-4 sm:grid-cols-3">
        {transitionTracks.map((t) => {
          const p = trackProgress(t, state.checks)
          const isActive = t.id === activeTrackId
          const isFocus = t.id === focus.id
          return (
            <button
              key={t.id}
              onClick={() => setActiveTrackId(t.id)}
              aria-pressed={isActive}
              className={cx(
                'card card-hover p-5 text-left transition-all',
                isActive ? 'ring-2 ring-teal-300' : '',
              )}
            >
              <div className="flex items-center justify-between">
                <span
                  className={cx(
                    'chip',
                    isActive ? 'bg-teal-500 text-white' : 'bg-lav-50 text-lav-600',
                  )}
                >
                  {t.age}
                </span>
                <span className="text-xs font-semibold text-ink-faint">{p.pct}%</span>
              </div>
              <h3 className="section-title mt-3 text-base font-semibold">{t.title}</h3>
              <p className={cx('mt-1 text-xs font-medium', isFocus ? 'text-lav-600' : 'text-ink-faint')}>
                {trackTiming(t.anchorAge, t.id)}
              </p>
              <div className="mt-3">
                <ProgressBar value={p.pct} />
              </div>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {t.focus.slice(0, 3).map((f) => (
                  <span key={f} className="chip bg-canvas text-ink-soft">{f}</span>
                ))}
              </div>
            </button>
          )
        })}
      </div>

      {/* Active track detail */}
      <div className="grid gap-5 lg:grid-cols-5">
        {/* Guidance */}
        <div className="space-y-5 lg:col-span-3">
          <Card>
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="chip bg-teal-50 text-teal-700">{track.age}</span>
                <h2 className="section-title mt-2 text-xl font-semibold">{track.title}</h2>
              </div>
            </div>
            <p className="mt-2 text-ink-soft">{track.summary}</p>

            <div className="mt-5 space-y-4">
              {track.guidance.map((g) => (
                <div key={g.heading} className="rounded-xl border border-line p-4">
                  <div className="flex items-center gap-2 text-teal-700">
                    <Info className="h-4 w-4" />
                    <h4 className="font-semibold text-ink">{g.heading}</h4>
                  </div>
                  <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">{g.body}</p>
                </div>
              ))}
            </div>

            <div className="mt-5 flex items-start gap-3 rounded-xl bg-amber-50 p-4">
              <Lightbulb className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
              <p className="text-sm leading-relaxed text-ink-soft">
                <span className="font-semibold text-amber-700">A note for the road: </span>
                {track.tip}
              </p>
            </div>
          </Card>
        </div>

        {/* Interactive checklist — persists in the family record */}
        <div className="lg:col-span-2">
          <Card className="lg:sticky lg:top-24">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ListChecks className="h-5 w-5 text-teal-600" />
                <h3 className="section-title text-base font-semibold">Preparation checklist</h3>
              </div>
              <span className="chip bg-teal-50 text-teal-700">{progress.pct}%</span>
            </div>
            <div className="mb-4">
              <ProgressBar value={progress.pct} />
            </div>
            <ul className="space-y-2">
              {track.checklist.map((item) => {
                const done = !!state.checks[item.id]
                const label = personalize(item.label, state.child.name)
                return (
                  <li key={item.id}>
                    <button
                      onClick={() => dispatch({ type: 'toggle-check', id: item.id })}
                      role="checkbox"
                      aria-checked={done}
                      className={cx(
                        'flex w-full items-start gap-3 rounded-xl border p-3 text-left transition-colors',
                        done ? 'border-teal-200 bg-teal-50/60' : 'border-line hover:bg-canvas',
                      )}
                    >
                      <span
                        className={cx(
                          'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border',
                          done ? 'border-teal-500 bg-teal-500 text-white' : 'border-ink-faint/40 text-transparent',
                        )}
                        aria-hidden
                      >
                        {done ? <Check className="h-3.5 w-3.5" /> : <CircleDashed className="h-3.5 w-3.5 text-ink-faint/40" />}
                      </span>
                      <span className="min-w-0">
                        <span
                          className={cx(
                            'block text-sm font-medium',
                            done ? 'text-ink-faint line-through' : 'text-ink',
                          )}
                        >
                          {label}
                        </span>
                        {item.detail && (
                          <span className="mt-0.5 block text-xs text-ink-faint">{item.detail}</span>
                        )}
                      </span>
                    </button>
                  </li>
                )
              })}
            </ul>
            <p className="mt-3 text-xs text-ink-faint">
              Progress saves automatically — it’ll be here when you come back.
            </p>

            <Link to="/companion" className="btn-ghost mt-3 w-full">
              Ask the AI Companion about {track.age} <ArrowRight className="h-4 w-4" />
            </Link>
          </Card>
        </div>
      </div>

      {/* Scope reminder */}
      <p className="rounded-xl bg-canvas px-4 py-3 text-xs leading-relaxed text-ink-faint">
        This navigator is for understanding and preparation. It doesn’t provide medical or legal
        advice — for decisions like guardianship or benefits eligibility, it helps you get ready to
        talk with the right professional.
      </p>
    </div>
  )
}
