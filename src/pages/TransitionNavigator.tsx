import { useMemo, useState } from 'react'
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
import { transitionTracks, transitionStats, type ChecklistItem } from '../data/transition'
import { cx } from '../lib/cx'

export default function TransitionNavigator() {
  const [activeTrack, setActiveTrack] = useState(transitionTracks[1].id) // default Age 18
  // Local interactive state for checklists — keyed by item id.
  const [checks, setChecks] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {}
    transitionTracks.forEach((t) => t.checklist.forEach((i) => (init[i.id] = i.done)))
    return init
  })

  const track = transitionTracks.find((t) => t.id === activeTrack)!

  const trackProgress = useMemo(() => {
    const done = track.checklist.filter((i) => checks[i.id]).length
    return Math.round((done / track.checklist.length) * 100)
  }, [track, checks])

  const toggle = (item: ChecklistItem) =>
    setChecks((prev) => ({ ...prev, [item.id]: !prev[item.id] }))

  return (
    <div className="space-y-7">
      <PageHeader
        eyebrow="Your current focus · the wedge"
        title="Transition to Adulthood Navigator"
        subtitle="The stretch from 14 to 22 is the most underserved part of the journey — and the most consequential. Here it’s broken into clear, age-anchored steps you can actually act on."
        icon={<Compass className="h-6 w-6" />}
      />

      {/* Stat row */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {transitionStats.map((s) => (
          <Card key={s.label} className="text-center">
            <p className="font-display text-2xl font-semibold text-teal-600">{s.value}</p>
            <p className="mt-1 text-xs text-ink-faint">{s.label}</p>
          </Card>
        ))}
      </div>

      {/* Track selector */}
      <div className="grid gap-4 sm:grid-cols-3">
        {transitionTracks.map((t) => {
          const done = t.checklist.filter((i) => checks[i.id]).length
          const pct = Math.round((done / t.checklist.length) * 100)
          const isActive = t.id === activeTrack
          return (
            <button
              key={t.id}
              onClick={() => setActiveTrack(t.id)}
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
                <span className="text-xs font-semibold text-ink-faint">{pct}%</span>
              </div>
              <h3 className="section-title mt-3 text-base font-semibold">{t.title}</h3>
              <div className="mt-3">
                <ProgressBar value={pct} />
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

        {/* Interactive checklist */}
        <div className="lg:col-span-2">
          <Card className="lg:sticky lg:top-24">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ListChecks className="h-5 w-5 text-teal-600" />
                <h3 className="section-title text-base font-semibold">Preparation checklist</h3>
              </div>
              <span className="chip bg-teal-50 text-teal-700">{trackProgress}%</span>
            </div>
            <div className="mb-4">
              <ProgressBar value={trackProgress} />
            </div>
            <ul className="space-y-2">
              {track.checklist.map((item) => {
                const done = checks[item.id]
                return (
                  <li key={item.id}>
                    <button
                      onClick={() => toggle(item)}
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
                          {item.label}
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

            <Link to="/companion" className="btn-ghost mt-4 w-full">
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
