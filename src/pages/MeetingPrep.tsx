// Meeting Prep — a printable kit for the meetings on this road: IEP, attorney,
// benefits, medical. Step 1 captures the meeting; step 2 assembles the kit
// from the reasoning engine (buildMeetingKit) and the live record: the agenda,
// questions generated from this family's actual open items, a document list
// cross-checked against the real vault, open decisions, relevant deadlines,
// room to take notes, and the follow-ups that flow back into the record.

import { useMemo, useState } from 'react'
import { ClipboardList, RefreshCcw, SlidersHorizontal } from 'lucide-react'
import { PageHeader, Card } from '../components/ui'
import {
  CheckLine,
  NoteLines,
  PrintActions,
  PrintFooter,
  PrintHeader,
  PrintSheet,
  SectionToggle,
  SheetSection,
  usePrintSections,
} from '../components/print'
import { useFamily } from '../store/FamilyContext'
import { buildMeetingKit, type MeetingType } from '../intelligence/meetings'
import { buildLookAhead } from '../intelligence/lookahead'
import {
  concernOptions,
  currentTrack,
  firstName,
  getAge,
  personalize,
  stageIdForAge,
} from '../store/selectors'
import { cx } from '../lib/cx'

const meetingTypes: { id: MeetingType; label: string; blurb: string }[] = [
  { id: 'iep', label: 'IEP / school meeting', blurb: 'Goals, services, and transition planning with the school team.' },
  { id: 'attorney', label: 'Attorney consultation', blurb: 'Decision-making options, trusts, and the age-18 legal groundwork.' },
  { id: 'benefits', label: 'Benefits appointment', blurb: 'SSI, Medicaid, or waiver interviews and reviews.' },
  { id: 'medical', label: 'Medical appointment', blurb: 'Doctors, specialists, and the move toward adult healthcare.' },
]

type SectionKey =
  | 'purpose'
  | 'agenda'
  | 'priorities'
  | 'questions'
  | 'documents'
  | 'goals'
  | 'open'
  | 'deadlines'
  | 'notes'
  | 'followup'

const sectionDefaults: Record<SectionKey, boolean> = {
  purpose: true,
  agenda: true,
  priorities: true,
  questions: true,
  documents: true,
  goals: true,
  open: true,
  deadlines: true,
  notes: true,
  followup: true,
}

export default function MeetingPrep() {
  const { state } = useFamily()
  const { child, parent, goals } = state
  const { sections: on, toggle } = usePrintSections(sectionDefaults)

  // Step 1 — which meeting, when, and who's in the room.
  const [step, setStep] = useState<1 | 2>(1)
  const [meetingType, setMeetingType] = useState<MeetingType>('iep')
  const [meetingDate, setMeetingDate] = useState('')
  const [attendees, setAttendees] = useState('')

  const name = firstName(child.name) || 'your child'
  const age = getAge(child)
  const stageId = stageIdForAge(age)

  // The kit itself — reused from the reasoning engine, personalized from the
  // record and cross-checked against the actual vault.
  const kit = useMemo(() => buildMeetingKit(meetingType, state), [meetingType, state])
  const kitItems = (heading: string) => kit.sections?.find((s) => s.heading === heading)?.items ?? []
  const agendaItems = kitItems('Suggested agenda')
  const questionItems = kitItems('Questions worth asking')
  const documentItems = kitItems('Documents — checked against your vault')
  const followUpItems = kitItems('After the meeting')

  // Record context around the kit — all derived, never asserted.
  const openGoals = goals.filter((g) => g.progress < 100)
  const priorities = state.concerns
    .map((id) => concernOptions.find((c) => c.id === id)?.label)
    .filter((label): label is string => Boolean(label))
  const openItems =
    stageId === 'transition' || age >= 12
      ? currentTrack(age)
          .checklist.filter((i) => !state.checks[i.id])
          .map((i) => ({ id: i.id, label: personalize(i.label, child.name) }))
      : []
  const deadlines = useMemo(
    () =>
      buildLookAhead(state)
        .flatMap((h) => h.events)
        .slice(0, 6),
    [state],
  )

  const typeLabel = meetingTypes.find((t) => t.id === meetingType)!.label
  const dateLabel = meetingDate
    ? new Date(`${meetingDate}T00:00:00`).toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : ''

  const toggles: { key: SectionKey; label: string }[] = [
    { key: 'purpose', label: 'Why this meeting' },
    { key: 'agenda', label: 'Suggested agenda' },
    { key: 'priorities', label: 'Our current priorities' },
    { key: 'questions', label: 'Questions to ask' },
    { key: 'documents', label: 'Documents to bring' },
    { key: 'goals', label: 'Active goals' },
    { key: 'open', label: 'Open decisions' },
    { key: 'deadlines', label: 'Relevant deadlines' },
    { key: 'notes', label: 'Notes (blank lines)' },
    { key: 'followup', label: 'After the meeting' },
  ]

  return (
    <div className="space-y-7">
      <div className="no-print">
        <PageHeader
          eyebrow="Walk in prepared"
          title="Meeting Prep"
          subtitle={`A take-with-you kit built from ${name === 'your child' ? 'your' : `${name}’s`} actual record — the agenda, the questions worth asking, and a document list checked against your vault.`}
          icon={<ClipboardList className="h-6 w-6" />}
          action={step === 2 ? <PrintActions /> : undefined}
        />
      </div>

      {/* ---- Step 1: which meeting? ---- */}
      {step === 1 && (
        <Card className="no-print max-w-2xl">
          <p className="text-sm font-semibold text-ink">What kind of meeting is it?</p>
          <div className="mt-3 grid gap-2.5 sm:grid-cols-2">
            {meetingTypes.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setMeetingType(t.id)}
                aria-pressed={meetingType === t.id}
                className={cx(
                  'rounded-2xl border p-4 text-left transition-colors',
                  meetingType === t.id
                    ? 'border-teal-400 bg-teal-50'
                    : 'border-line bg-surface hover:bg-canvas',
                )}
              >
                <p className="font-semibold text-ink">{t.label}</p>
                <p className="mt-1 text-xs leading-relaxed text-ink-soft">{t.blurb}</p>
              </button>
            ))}
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-wide text-ink-faint">
                Meeting date (optional)
              </span>
              <input
                type="date"
                value={meetingDate}
                onChange={(e) => setMeetingDate(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-line bg-surface px-3 py-2 text-sm text-ink focus:border-teal-300"
              />
            </label>
            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-wide text-ink-faint">
                Who will be there (optional)
              </span>
              <input
                value={attendees}
                onChange={(e) => setAttendees(e.target.value)}
                placeholder="e.g. Ms. Rivera, the school psychologist"
                className="mt-1.5 w-full rounded-xl border border-line bg-surface px-3 py-2 text-sm text-ink placeholder:text-ink-faint focus:border-teal-300"
              />
            </label>
          </div>
          <button type="button" onClick={() => setStep(2)} className="btn-primary mt-5">
            Build my kit
          </button>
        </Card>
      )}

      {/* ---- Step 2: the kit ---- */}
      {step === 2 && (
        <div className="grid items-start gap-6 lg:grid-cols-[290px_1fr]">
          <div className="no-print space-y-4">
            <Card>
              <div className="mb-2 flex items-center gap-2 text-ink-soft">
                <SlidersHorizontal className="h-4 w-4" />
                <p className="text-sm font-semibold">What to include</p>
              </div>
              <div className="space-y-0.5">
                {toggles.map((t) => (
                  <SectionToggle
                    key={t.key}
                    label={t.label}
                    checked={on[t.key]}
                    onToggle={() => toggle(t.key)}
                  />
                ))}
              </div>
            </Card>
            <button type="button" onClick={() => setStep(1)} className="btn-soft w-full">
              <RefreshCcw className="h-4 w-4" /> Change meeting details
            </button>
          </div>

          <PrintSheet>
            <PrintHeader preparedBy={parent.name} />
            <h1 className="mt-3 font-display text-2xl font-semibold text-ink sm:text-3xl">
              {typeLabel} — {firstName(child.name) || 'our child'}
            </h1>
            {(dateLabel || attendees.trim()) && (
              <p className="mt-1 text-sm text-ink-soft">
                {[dateLabel, attendees.trim() && `With: ${attendees.trim()}`]
                  .filter(Boolean)
                  .join(' · ')}
              </p>
            )}

            {on.purpose && (
              <SheetSection title="Why this meeting">
                <p>{kit.intro}</p>
                {kit.professionalNote && (
                  <p className="mt-1.5 text-[13px] italic text-ink-soft">{kit.professionalNote}</p>
                )}
              </SheetSection>
            )}

            {on.agenda && (
              <SheetSection title="Suggested agenda" has={agendaItems.length > 0} hint="The agenda appears once the kit is built.">
                <ol className="list-decimal space-y-1 pl-5">
                  {agendaItems.map((a) => (
                    <li key={a}>{a}</li>
                  ))}
                </ol>
              </SheetSection>
            )}

            {on.priorities && (
              <SheetSection
                title="Our current priorities"
                has={priorities.length > 0}
                hint="The concerns you chose during onboarding will appear here."
              >
                <ul className="list-disc space-y-1 pl-5">
                  {priorities.map((p) => (
                    <li key={p}>{p}</li>
                  ))}
                </ul>
              </SheetSection>
            )}

            {on.questions && (
              <SheetSection
                title="Questions to ask"
                has={questionItems.length > 0}
                hint="Questions are generated from your record once the kit is built."
              >
                <ul className="list-disc space-y-1 pl-5">
                  {questionItems.map((q) => (
                    <li key={q}>{q}</li>
                  ))}
                </ul>
              </SheetSection>
            )}

            {on.documents && (
              <SheetSection
                title="Documents to bring"
                has={documentItems.length > 0}
                hint="The document list is cross-checked against your vault."
              >
                <ul className="space-y-1">
                  {documentItems.map((d) => (
                    <li key={d}>{d}</li>
                  ))}
                </ul>
                {kit.nextSteps?.[0] && (
                  <p className="mt-1.5 text-[13px] italic text-ink-soft">{kit.nextSteps[0]}</p>
                )}
              </SheetSection>
            )}

            {on.goals && (
              <SheetSection
                title="Active goals"
                has={openGoals.length > 0}
                hint="Open goals from the Home page will appear here."
              >
                <ul className="list-disc space-y-1 pl-5">
                  {openGoals.map((g) => (
                    <li key={g.id}>
                      {g.title}{' '}
                      <span className="text-ink-soft">
                        ({g.area} · {g.progress}% done)
                      </span>
                    </li>
                  ))}
                </ul>
              </SheetSection>
            )}

            {on.open && (
              <SheetSection
                title="Open decisions & unresolved items"
                has={openItems.length > 0}
                hint="Open transition-checklist items for this stage will appear here."
              >
                <ul className="list-disc space-y-1 pl-5">
                  {openItems.map((i) => (
                    <li key={i.id}>{i.label}</li>
                  ))}
                </ul>
              </SheetSection>
            )}

            {on.deadlines && (
              <SheetSection
                title="Relevant deadlines"
                has={deadlines.length > 0}
                hint="Dates projected from the birthday and your open steps will appear here."
              >
                <ul className="list-disc space-y-1 pl-5">
                  {deadlines.map((d) => (
                    <li key={d.id}>
                      {d.title} <span className="text-ink-soft">({d.dateLabel})</span>
                    </li>
                  ))}
                </ul>
                <p className="mt-1.5 text-[13px] italic text-ink-soft">
                  Verify every date against official letters — these are projections from the record.
                </p>
              </SheetSection>
            )}

            {on.notes && (
              <SheetSection title="Notes">
                <NoteLines count={8} />
              </SheetSection>
            )}

            {on.followup && (
              <SheetSection title="After the meeting">
                {followUpItems.length > 0 && (
                  <ul className="mb-2 list-disc space-y-1 pl-5">
                    {followUpItems.map((f) => (
                      <li key={f}>{f}</li>
                    ))}
                  </ul>
                )}
                <ul>
                  <CheckLine>Decisions made: ____________________________________________</CheckLine>
                  <CheckLine>New dates to record: _______________________________________</CheckLine>
                  <CheckLine>Documents received (add them to the vault)</CheckLine>
                  <CheckLine>Next steps and who owns them: ______________________________</CheckLine>
                </ul>
              </SheetSection>
            )}

            <PrintFooter />
          </PrintSheet>
        </div>
      )}
    </div>
  )
}
