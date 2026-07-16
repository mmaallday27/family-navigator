// The first five minutes. A calm, guided welcome that turns "I don't know
// where to start" into "I finally understand the road ahead" — then hands the
// family a home base personalized to their child's stage and their concerns.

import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Check, Compass, Heart, MapPin, Sparkles } from 'lucide-react'
import { cx } from '../lib/cx'
import { useFamily, type ChildProfile, type Goal } from '../store/FamilyContext'
import {
  ageFromMonthYear,
  birthYearOptions,
  concernOptions,
  firstName,
  interestOptions,
  monthOptions,
  stageIdForAge,
  strengthOptions,
} from '../store/selectors'
import { journeyStages } from '../data/journey'
import { stateGuidanceFor, supportedStates } from '../data/stateRegistry'
import {
  demoChecks,
  demoChild,
  demoDocuments,
  demoGoals,
  demoLocation,
  demoParent,
  demoSavedResources,
} from '../data/demoFamily'

type Step = 'welcome' | 'about' | 'focus' | 'road'

// Mirror the in-progress form to sessionStorage so an accidental refresh
// never loses what a parent has typed. Cleared once onboarding completes.
const DRAFT_KEY = 'fn-onboarding-draft'

interface OnboardingDraft {
  step: Step
  parentName: string
  childName: string
  birthMonth: number | ''
  birthYear: number | ''
  diagnosis: string
  concerns: string[]
  strengths: string[]
  interests: string[]
  locState?: string
  county?: string
  zip?: string
  consent?: boolean
}

function loadDraft(): OnboardingDraft | null {
  try {
    const raw = sessionStorage.getItem(DRAFT_KEY)
    return raw ? (JSON.parse(raw) as OnboardingDraft) : null
  } catch {
    return null
  }
}

function clearDraft() {
  try {
    sessionStorage.removeItem(DRAFT_KEY)
  } catch {
    // Storage unavailable — nothing to clear.
  }
}

function StepDots({ step }: { step: Step }) {
  const order: Step[] = ['welcome', 'about', 'focus', 'road']
  const idx = order.indexOf(step)
  return (
    <div className="flex items-center gap-2">
      <span className="sr-only">
        Step {idx + 1} of {order.length}
      </span>
      {order.map((s, i) => (
        <span
          key={s}
          aria-hidden
          className={cx(
            'h-1.5 rounded-full transition-all duration-300',
            i === idx ? 'w-6 bg-teal-500' : i < idx ? 'w-1.5 bg-teal-300' : 'w-1.5 bg-line',
          )}
        />
      ))}
    </div>
  )
}

function ChipToggle({
  label,
  selected,
  onToggle,
}: {
  label: string
  selected: boolean
  onToggle: () => void
}) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={selected}
      onClick={onToggle}
      className={cx(
        'inline-flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-sm font-medium transition-colors',
        selected
          ? 'border-teal-400 bg-teal-50 text-teal-700'
          : 'border-line bg-surface text-ink-soft hover:bg-canvas',
      )}
    >
      {selected && <Check className="h-3.5 w-3.5" />}
      {label}
    </button>
  )
}

export default function Onboarding() {
  const { state, dispatch } = useFamily()
  const navigate = useNavigate()

  // Form state — restored from the session draft if a refresh interrupted it.
  const [draft] = useState(loadDraft)
  const [step, setStep] = useState<Step>(draft?.step ?? 'welcome')
  const [parentName, setParentName] = useState(draft?.parentName ?? '')
  const [childName, setChildName] = useState(draft?.childName ?? '')
  const [birthMonth, setBirthMonth] = useState<number | ''>(draft?.birthMonth ?? '')
  const [birthYear, setBirthYear] = useState<number | ''>(draft?.birthYear ?? '')
  const [diagnosis, setDiagnosis] = useState(draft?.diagnosis ?? '')
  const [concerns, setConcerns] = useState<string[]>(draft?.concerns ?? [])
  const [strengths, setStrengths] = useState<string[]>(draft?.strengths ?? [])
  const [interests, setInterests] = useState<string[]>(draft?.interests ?? [])
  const [locState, setLocState] = useState(draft?.locState ?? '')
  const [county, setCounty] = useState(draft?.county ?? '')
  const [zip, setZip] = useState(draft?.zip ?? '')
  const [consent, setConsent] = useState(draft?.consent ?? false)

  useEffect(() => {
    try {
      sessionStorage.setItem(
        DRAFT_KEY,
        JSON.stringify({
          step,
          parentName,
          childName,
          birthMonth,
          birthYear,
          diagnosis,
          concerns,
          strengths,
          interests,
          locState,
          county,
          zip,
          consent,
        } satisfies OnboardingDraft),
      )
    } catch {
      // Storage unavailable — typing just won't survive a refresh.
    }
  }, [step, parentName, childName, birthMonth, birthYear, diagnosis, concerns, strengths, interests, locState, county, zip, consent])

  const yearChoices = useMemo(() => birthYearOptions(), [])
  const chosenGuidance = stateGuidanceFor(locState)
  const age = birthMonth === '' || birthYear === '' ? null : ageFromMonthYear(birthMonth, birthYear)
  const stageId = age === null ? null : stageIdForAge(age)
  const stage = journeyStages.find((s) => s.id === stageId)

  const aboutValid = parentName.trim() !== '' && childName.trim() !== '' && age !== null && age >= 0

  const toggle = (list: string[], set: (v: string[]) => void, id: string) =>
    set(list.includes(id) ? list.filter((x) => x !== id) : [...list, id])

  const startDemo = () => {
    dispatch({
      type: 'complete-onboarding',
      isDemo: true,
      child: demoChild,
      parent: demoParent,
      concerns: ['legal-18', 'employment', 'independence'],
      goals: demoGoals,
      checks: demoChecks,
      documents: demoDocuments,
      savedResources: demoSavedResources,
      location: demoLocation,
      // Exploring with the sample family still uses the product — same terms.
      consentAcknowledgedAt: new Date().toISOString(),
    })
    clearDraft()
    navigate('/')
  }

  const starterGoals: Goal[] = useMemo(
    () =>
      concernOptions
        .filter((c) => concerns.includes(c.id))
        .map((c, i) => ({
          id: `sg${i}`,
          title: c.goal.title,
          area: c.goal.area,
          due: 'This year',
          progress: 0,
          owner: firstName(parentName) || 'You',
        })),
    [concerns, parentName],
  )

  const finish = () => {
    if (!aboutValid || birthMonth === '' || birthYear === '' || !consent) return
    const child: ChildProfile = {
      name: childName.trim(),
      // The real birth month & year, anchored to the 1st — every projected
      // legal date downstream is derived from this.
      birthDate: `${birthYear}-${String(birthMonth).padStart(2, '0')}-01`,
      diagnosis: diagnosis.trim(),
      diagnosedAt: '',
      strengths,
      interests,
      communication: '',
      schoolGrade: '',
    }
    dispatch({
      type: 'complete-onboarding',
      isDemo: false,
      child,
      parent: { name: parentName.trim(), relationship: 'Parent / Primary coordinator' },
      concerns,
      goals: starterGoals,
      checks: {},
      documents: [],
      savedResources: [],
      location: {
        state: locState,
        county: locState ? county.trim() : '',
        zip: locState ? zip.trim() : '',
      },
      consentAcknowledgedAt: new Date().toISOString(),
    })
    clearDraft()
    navigate('/')
  }

  return (
    <div className="flex min-h-screen flex-col bg-canvas">
      {/* Simple brand header */}
      <header className="flex items-center justify-between px-6 py-5 sm:px-10">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-500 text-white shadow-soft">
            <Compass className="h-5 w-5" />
          </div>
          <div className="leading-tight">
            <p className="font-display text-lg font-semibold text-ink">Family Navigator</p>
            <p className="text-xs text-ink-faint">See the road ahead</p>
          </div>
        </div>
        {state.onboarded && (
          <Link to="/" className="text-sm font-medium text-teal-600 hover:underline">
            Back to home
          </Link>
        )}
      </header>

      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center px-4 pb-16 sm:px-6">
        <div className="mb-6 flex justify-center">
          <StepDots step={step} />
        </div>

        {step === 'welcome' && (
          <div className="animate-fade-in text-center">
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-3xl bg-teal-50 text-teal-600">
              <Heart className="h-7 w-7" />
            </div>
            <h1 className="font-display text-3xl font-semibold leading-snug text-ink sm:text-4xl">
              You shouldn’t have to be the operating system.
            </h1>
            <p className="mx-auto mt-4 max-w-lg text-ink-soft">
              Raising a child with autism or developmental differences means coordinating schools,
              therapists, paperwork, benefits, and big transitions — usually alone. Family Navigator
              maps the whole road, remembers everything, and keeps the next step in view.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <button onClick={() => setStep('about')} className="btn-primary px-6 py-3">
                Set up your family <ArrowRight className="h-4 w-4" />
              </button>
              <button onClick={startDemo} className="btn-soft px-6 py-3">
                <Sparkles className="h-4 w-4 text-amber-500" /> Explore with a sample family
              </button>
            </div>
            <p className="mt-6 text-xs text-ink-faint">
              Your family’s record is stored securely in your account and follows you across
              devices. It’s yours — export or delete it whenever you choose.
            </p>
          </div>
        )}

        {step === 'about' && (
          <div className="card animate-fade-in p-6 sm:p-8">
            <h1 className="font-display text-2xl font-semibold text-ink">Tell us about your family</h1>
            <p className="mt-1.5 text-sm text-ink-soft">
              Just the basics — this personalizes the road ahead. You can change anything later.
            </p>

            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              <label className="block">
                <span className="text-xs font-semibold uppercase tracking-wide text-ink-faint">Your first name</span>
                <input
                  value={parentName}
                  onChange={(e) => setParentName(e.target.value)}
                  placeholder="e.g. Maya"
                  className="mt-1.5 w-full rounded-xl border border-line bg-surface px-4 py-2.5 text-sm text-ink placeholder:text-ink-faint focus:border-teal-300"
                />
              </label>
              <label className="block">
                <span className="text-xs font-semibold uppercase tracking-wide text-ink-faint">Your child’s first name</span>
                <input
                  value={childName}
                  onChange={(e) => setChildName(e.target.value)}
                  placeholder="e.g. Eli"
                  className="mt-1.5 w-full rounded-xl border border-line bg-surface px-4 py-2.5 text-sm text-ink placeholder:text-ink-faint focus:border-teal-300"
                />
              </label>
              <div>
                <span className="text-xs font-semibold uppercase tracking-wide text-ink-faint">When they were born</span>
                <div className="mt-1.5 flex gap-2">
                  <select
                    value={birthMonth}
                    onChange={(e) => setBirthMonth(e.target.value === '' ? '' : Number(e.target.value))}
                    aria-label="Birth month"
                    className="min-w-0 flex-1 rounded-xl border border-line bg-surface px-3 py-2.5 text-sm text-ink focus:border-teal-300"
                  >
                    <option value="">Month</option>
                    {monthOptions.map((m, i) => (
                      <option key={m} value={i + 1}>
                        {m}
                      </option>
                    ))}
                  </select>
                  <select
                    value={birthYear}
                    onChange={(e) => setBirthYear(e.target.value === '' ? '' : Number(e.target.value))}
                    aria-label="Birth year"
                    className="w-28 rounded-xl border border-line bg-surface px-3 py-2.5 text-sm text-ink focus:border-teal-300"
                  >
                    <option value="">Year</option>
                    {yearChoices.map((y) => (
                      <option key={y} value={y}>
                        {y}
                      </option>
                    ))}
                  </select>
                </div>
                {age !== null && (
                  <p className="mt-1.5 text-xs text-ink-faint">
                    So {firstName(childName) ? `${firstName(childName)} is` : 'they’re'} {age} now — we use this to keep
                    every legal date accurate.
                  </p>
                )}
              </div>
              <label className="block sm:col-span-2">
                <span className="text-xs font-semibold uppercase tracking-wide text-ink-faint">Diagnosis (optional)</span>
                <input
                  value={diagnosis}
                  onChange={(e) => setDiagnosis(e.target.value)}
                  placeholder="e.g. Autism Spectrum — or leave blank if you’re still exploring"
                  className="mt-1.5 w-full rounded-xl border border-line bg-surface px-4 py-2.5 text-sm text-ink placeholder:text-ink-faint focus:border-teal-300"
                />
              </label>

              {/* Where you live — drives state-aware guidance. Told, never inferred. */}
              <div className="sm:col-span-2">
                <span className="text-xs font-semibold uppercase tracking-wide text-ink-faint">
                  Where you live (optional)
                </span>
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
                        className="w-full rounded-xl border border-line bg-surface px-4 py-2.5 text-sm text-ink placeholder:text-ink-faint focus:border-teal-300 sm:w-32"
                      />
                    </>
                  )}
                </div>
                <p className="mt-1.5 text-xs text-ink-faint">
                  We ask because services and deadlines differ by state and county. It’s never
                  inferred — you tell us, or you skip it.
                </p>
                {chosenGuidance && (
                  <p className="mt-2 rounded-xl bg-teal-50 px-3 py-2 text-xs leading-relaxed text-teal-700 animate-fade-in">
                    {chosenGuidance.displayName} is our first deeply-mapped state — your guidance
                    will be grounded in {chosenGuidance.displayName}’s actual systems.
                  </p>
                )}
              </div>
            </div>

            {stage && (
              <div className="mt-5 flex items-start gap-3 rounded-2xl bg-lav-50 p-4 animate-fade-in">
                <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-lav-500" />
                <p className="text-sm leading-relaxed text-ink-soft">
                  At {age}, {firstName(childName) || 'your child'} is in the{' '}
                  <span className="font-semibold text-lav-600">{stage.title}</span> stage —{' '}
                  {stage.tagline.toLowerCase().replace(/\.$/, '')}. We’ll shape everything around that.
                </p>
              </div>
            )}

            <div className="mt-6 flex items-center justify-between">
              <button onClick={() => setStep('welcome')} className="btn-soft">
                <ArrowLeft className="h-4 w-4" /> Back
              </button>
              <button onClick={() => setStep('focus')} disabled={!aboutValid} className="btn-primary">
                Continue <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {step === 'focus' && (
          <div className="card animate-fade-in p-6 sm:p-8">
            <h1 className="font-display text-2xl font-semibold text-ink">
              What’s on your mind right now?
            </h1>
            <p className="mt-1.5 text-sm text-ink-soft">
              Choose anything that resonates — each one becomes a starter goal on your home base. All optional.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              {concernOptions.map((c) => (
                <ChipToggle
                  key={c.id}
                  label={c.label}
                  selected={concerns.includes(c.id)}
                  onToggle={() => toggle(concerns, setConcerns, c.id)}
                />
              ))}
            </div>

            <h2 className="mt-8 font-display text-lg font-semibold text-ink">
              And what is {firstName(childName) || 'your child'} great at?
            </h2>
            <p className="mt-1 text-sm text-ink-soft">
              Strengths lead the planning here — not just needs.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {strengthOptions.map((s) => (
                <ChipToggle
                  key={s}
                  label={s}
                  selected={strengths.includes(s)}
                  onToggle={() => toggle(strengths, setStrengths, s)}
                />
              ))}
            </div>

            <h2 className="mt-8 font-display text-lg font-semibold text-ink">Things they love</h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {interestOptions.map((s) => (
                <ChipToggle
                  key={s}
                  label={s}
                  selected={interests.includes(s)}
                  onToggle={() => toggle(interests, setInterests, s)}
                />
              ))}
            </div>

            <div className="mt-8 flex items-center justify-between">
              <button onClick={() => setStep('about')} className="btn-soft">
                <ArrowLeft className="h-4 w-4" /> Back
              </button>
              <button onClick={() => setStep('road')} className="btn-primary">
                See your road <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {step === 'road' && stage && (
          <div className="animate-fade-in">
            <div className="text-center">
              <h1 className="font-display text-2xl font-semibold text-ink sm:text-3xl">
                Here’s the road, {firstName(parentName)}.
              </h1>
              <p className="mx-auto mt-2 max-w-lg text-ink-soft">
                Six stages, from first questions to lifelong planning. You never have to hold the
                whole map in your head again — that’s our job now.
              </p>
            </div>

            {/* Mini journey strip */}
            <div className="card mt-6 p-5">
              <ol className="space-y-3">
                {journeyStages.map((s) => {
                  const isHere = s.id === stage.id
                  const behind = s.index < stage.index && s.id !== 'legacy'
                  return (
                    <li key={s.id} className="flex items-center gap-3">
                      <span
                        className={cx(
                          'flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold',
                          isHere
                            ? 'bg-lav-500 text-white ring-4 ring-lav-100'
                            : behind
                              ? 'bg-teal-500 text-white'
                              : 'border border-line bg-surface text-ink-faint',
                        )}
                      >
                        {behind ? <Check className="h-3.5 w-3.5" /> : s.index}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className={cx('text-sm font-semibold', isHere ? 'text-lav-600' : 'text-ink')}>
                          {s.title}
                          {isHere && <span className="ml-2 text-xs font-medium text-lav-500">← you are here</span>}
                        </p>
                      </div>
                      <span className="hidden text-xs text-ink-faint sm:block">Ages {s.ageRange}</span>
                    </li>
                  )
                })}
              </ol>
            </div>

            {starterGoals.length > 0 && (
              <div className="card mt-4 p-5">
                <p className="text-sm font-semibold text-ink">
                  We turned what’s on your mind into {starterGoals.length}{' '}
                  {starterGoals.length === 1 ? 'starter goal' : 'starter goals'}:
                </p>
                <ul className="mt-2 space-y-1.5">
                  {starterGoals.map((g) => (
                    <li key={g.id} className="flex gap-2 text-sm text-ink-soft">
                      <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-amber-400" /> {g.title}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Data-use acknowledgement — required before the record is created. */}
            <label className="card mt-6 flex cursor-pointer items-start gap-3 p-4 text-left">
              <input
                type="checkbox"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                className="mt-0.5 h-4 w-4 shrink-0 rounded border-line accent-teal-600"
              />
              <span className="text-sm leading-relaxed text-ink-soft">
                I understand Family Navigator stores my family’s information securely in my
                account, uses it to personalize guidance (including AI-generated guidance), and
                that I can export or delete everything at any time. This is a pilot — guidance is
                educational, not medical or legal advice. See our{' '}
                <Link to="/privacy" className="font-medium text-teal-600 hover:underline">
                  privacy practices
                </Link>{' '}
                and{' '}
                <Link to="/terms" className="font-medium text-teal-600 hover:underline">
                  terms
                </Link>
                .
              </span>
            </label>

            <div className="mt-6 flex items-center justify-between">
              <button onClick={() => setStep('focus')} className="btn-soft">
                <ArrowLeft className="h-4 w-4" /> Back
              </button>
              <button onClick={finish} disabled={!consent} className="btn-primary px-6 py-3">
                Open your home base <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
