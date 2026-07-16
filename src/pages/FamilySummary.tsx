// The Family Summary — a configurable one-page introduction a parent hands a
// teacher, a new therapist, or anyone meeting their child for the first time.
// The person comes before the systems around them: strengths and interests
// lead, the diagnosis is shared only if the family chooses to, and every line
// is drawn from the real family record — never a generic worksheet.

import { useState } from 'react'
import { FileText, SlidersHorizontal } from 'lucide-react'
import { PageHeader, Card } from '../components/ui'
import {
  CheckLine,
  PrintActions,
  PrintFooter,
  PrintHeader,
  PrintSheet,
  SectionToggle,
  SheetSection,
  usePrintSections,
} from '../components/print'
import { useFamily } from '../store/FamilyContext'
import {
  concernOptions,
  firstName,
  getAge,
  keyMoments,
  personalize,
  stageIdForAge,
} from '../store/selectors'
import { journeyStages } from '../data/journey'
import { familyMembers } from '../data/family'

type SectionKey =
  | 'overview'
  | 'strengths'
  | 'communication'
  | 'support'
  | 'goals'
  | 'team'
  | 'transitions'
  | 'priorities'
  | 'important'
  | 'diagnosis'

const sectionDefaults: Record<SectionKey, boolean> = {
  overview: true,
  strengths: true,
  communication: true,
  support: true,
  goals: true,
  team: true,
  transitions: true,
  priorities: true,
  important: true,
  diagnosis: false, // sensitive — the family shares it only if they choose to
}

/** What-helps lines derived from the family's stated concerns — phrased
 *  strengths-first, in terms a teacher or provider can act on. */
const supportByConcern: Record<string, string> = {
  iep: '{name} does best with clear goals and consistent accommodations — the IEP is where those live.',
  independence: 'Regular, low-pressure chances to practice everyday independence skills.',
  employment: 'Opportunities to explore work interests and build job-readiness skills.',
  'after-school': 'Planning that connects today’s work to life after high school.',
  'legal-18': 'The family is preparing the legal groundwork for adulthood — steady routines help during this season.',
  benefits: 'The family is navigating benefits applications — timely documentation from providers is a real help.',
  housing: 'The family is thinking ahead about housing — independent-living practice supports that path.',
  overwhelmed: 'A coordinated, communicative team lightens the load for everyone.',
}

export default function FamilySummary() {
  const { state } = useFamily()
  const { child, parent, goals } = state
  const { sections: on, toggle } = usePrintSections(sectionDefaults)
  const [importantNote, setImportantNote] = useState('')

  const name = firstName(child.name) || 'Your child'
  const birthKnown = !Number.isNaN(new Date(`${child.birthDate}T00:00:00`).getTime())
  const age = getAge(child)
  const stage = journeyStages.find((s) => s.id === stageIdForAge(age))

  // Everything below is derived from the live record — nothing is asserted.
  const overviewBits = [
    birthKnown ? `Age ${age}` : '',
    child.schoolGrade,
    stage && birthKnown ? `${stage.title} stage of the journey` : '',
  ].filter(Boolean)

  const openGoals = goals.filter((g) => g.progress < 100)
  const supportLines = state.concerns
    .map((id) => supportByConcern[id])
    .filter(Boolean)
    .map((line) => personalize(line, child.name))
  const priorities = state.concerns
    .map((id) => concernOptions.find((c) => c.id === id)?.label)
    .filter((label): label is string => Boolean(label))
  const moments = keyMoments(child).slice(0, 3)

  // Support team: the demo family has a full roster in the Family Circle;
  // a real family's record holds the parent — others are omitted gracefully
  // until team members live in the persistent record.
  const team = state.isDemo
    ? familyMembers
        .filter((m) => m.initials !== '+')
        .map((m) => ({ id: m.id, name: m.name, role: m.role }))
    : parent.name
      ? [{ id: 'parent', name: parent.name, role: `${parent.relationship || 'Parent'} · primary contact` }]
      : []

  const toggles: { key: SectionKey; label: string; note?: string }[] = [
    { key: 'overview', label: 'Overview', note: 'Name, age, and grade — never the birth date.' },
    { key: 'strengths', label: 'Strengths & interests' },
    { key: 'communication', label: 'Communication' },
    { key: 'support', label: `What helps ${name}` },
    { key: 'goals', label: 'Current goals' },
    { key: 'team', label: 'Support team' },
    { key: 'transitions', label: 'Key transition context' },
    { key: 'priorities', label: 'Family priorities' },
    { key: 'important', label: 'Important to know', note: 'Your own words, typed below.' },
    { key: 'diagnosis', label: 'Diagnosis', note: 'Off by default — share only if you choose to.' },
  ]

  return (
    <div className="space-y-7">
      <div className="no-print">
        <PageHeader
          eyebrow="A handoff, on your terms"
          title="Family Summary"
          subtitle={`A one-page introduction to ${name} for a teacher, therapist, or anyone new on the team. You choose what's included — the preview below is exactly what prints.`}
          icon={<FileText className="h-6 w-6" />}
          action={<PrintActions />}
        />
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-[290px_1fr]">
        {/* ---- Controls (screen only) ---- */}
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
                  note={t.note}
                  checked={on[t.key]}
                  onToggle={() => toggle(t.key)}
                />
              ))}
            </div>
          </Card>
          <Card>
            <label className="block">
              <span className="text-sm font-semibold text-ink">Important to know</span>
              <span className="mt-0.5 block text-xs text-ink-faint">
                Anything you want them to hear from you first — it prints in its own section.
              </span>
              <textarea
                value={importantNote}
                onChange={(e) => setImportantNote(e.target.value)}
                rows={4}
                placeholder={`e.g. ${name} needs a minute to warm up in new places — patience on day one pays off all year.`}
                className="mt-2 w-full rounded-xl border border-line bg-surface px-3 py-2 text-sm text-ink placeholder:text-ink-faint focus:border-teal-300"
              />
            </label>
          </Card>
        </div>

        {/* ---- The printable sheet ---- */}
        <PrintSheet>
          <PrintHeader preparedBy={parent.name} />
          <h1 className="mt-3 font-display text-3xl font-semibold text-ink">{name}</h1>
          <p className="mt-1 text-sm text-ink-soft">
            An introduction from {name === 'Your child' ? 'the' : `${name}’s`} family
          </p>

          {on.overview && (
            <SheetSection
              title="Overview"
              has={overviewBits.length > 0}
              hint="Add a birth month and grade on the Home page to fill this in."
            >
              <p>{overviewBits.join(' · ')}</p>
            </SheetSection>
          )}

          {on.strengths && (
            <SheetSection
              title="Strengths & interests"
              has={child.strengths.length > 0 || child.interests.length > 0}
              hint={`No strengths or interests recorded yet — add them on the Home page. They lead everything here.`}
            >
              {child.strengths.length > 0 && (
                <p>
                  <span className="font-semibold">Strengths:</span> {child.strengths.join(' · ')}
                </p>
              )}
              {child.interests.length > 0 && (
                <p className={child.strengths.length > 0 ? 'mt-1' : ''}>
                  <span className="font-semibold">Loves:</span> {child.interests.join(' · ')}
                </p>
              )}
              <p className="mt-1.5 text-[13px] text-ink-soft">
                Plans built around these go further than plans built around deficits.
              </p>
            </SheetSection>
          )}

          {on.communication && (
            <SheetSection
              title="Communication"
              has={Boolean(child.communication)}
              hint="Describe how they communicate (Home page → Edit profile) and it will appear here."
            >
              <p>{child.communication}</p>
            </SheetSection>
          )}

          {on.support && (
            <SheetSection
              title={`What helps ${name}`}
              has={supportLines.length > 0}
              hint="This section grows out of the concerns you chose during onboarding."
            >
              <ul className="list-disc space-y-1 pl-5">
                {supportLines.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            </SheetSection>
          )}

          {on.goals && (
            <SheetSection
              title="Current goals"
              has={openGoals.length > 0}
              hint="Open goals from the Home page will appear here."
            >
              <ul className="list-disc space-y-1 pl-5">
                {openGoals.map((g) => (
                  <li key={g.id}>
                    {g.title} <span className="text-ink-soft">({g.area})</span>
                  </li>
                ))}
              </ul>
            </SheetSection>
          )}

          {on.team && (
            <SheetSection
              title="Support team"
              has={team.length > 0}
              hint="Your Family Circle will appear here as it grows."
            >
              <ul className="space-y-1">
                {team.map((m) => (
                  <li key={m.id}>
                    <span className="font-semibold">{m.name}</span>{' '}
                    <span className="text-ink-soft">— {m.role}</span>
                  </li>
                ))}
              </ul>
            </SheetSection>
          )}

          {on.transitions && (
            <SheetSection
              title="Key transition context"
              has={moments.length > 0}
              hint="Upcoming legal and service milestones (derived from the birthday) will appear here."
            >
              <ul className="list-disc space-y-1 pl-5">
                {moments.map((m) => (
                  <li key={m.id}>
                    {m.title} <span className="text-ink-soft">({m.dateLabel})</span>
                  </li>
                ))}
              </ul>
            </SheetSection>
          )}

          {on.priorities && (
            <SheetSection
              title="Family priorities"
              has={priorities.length > 0}
              hint="The concerns you chose during onboarding will appear here as priorities."
            >
              <p>Right now, the family is focused on:</p>
              <ul className="mt-1 list-disc space-y-1 pl-5">
                {priorities.map((p) => (
                  <li key={p}>{p}</li>
                ))}
              </ul>
            </SheetSection>
          )}

          {on.diagnosis && (
            <SheetSection
              title="Diagnosis"
              has={Boolean(child.diagnosis)}
              hint="No diagnosis is recorded. If you add one, it still prints only when this section is on."
            >
              <p>
                {child.diagnosis}
                {child.diagnosedAt && <span className="text-ink-soft"> · diagnosed {child.diagnosedAt}</span>}
              </p>
            </SheetSection>
          )}

          {on.important && importantNote.trim() && (
            <SheetSection title="Important to know">
              <p className="whitespace-pre-line">{importantNote.trim()}</p>
            </SheetSection>
          )}

          {/* A small space for the reader to close the loop with the family. */}
          <SheetSection title="Questions for the family">
            <ul>
              <CheckLine>
                <span className="text-ink-soft">We’ll follow up about…</span>
              </CheckLine>
            </ul>
          </SheetSection>

          <PrintFooter />
        </PrintSheet>
      </div>
    </div>
  )
}
