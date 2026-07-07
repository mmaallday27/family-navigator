import {
  Users,
  UserPlus,
  Activity,
  MessageSquare,
  CalendarDays,
  Clock,
} from 'lucide-react'
import { PageHeader, Card, EmptyState } from '../components/ui'
import { AiNote } from '../components/ai'
import { familyMembers, familyActivity, type FamilyMember } from '../data/family'
import { useFamily } from '../store/FamilyContext'
import { firstName, getAge, initials, keyMoments, stageIdForAge } from '../store/selectors'
import { cx, accentChip, accentSolid, accentText } from '../lib/cx'

const statusLabel: Record<string, string> = {
  core: 'Core circle',
  active: 'Active now',
  occasional: 'As needed',
}

/** Which team roles matter most at each stage — shown as open slots for new families. */
const suggestedRolesByStage: Record<string, { role: string; contribution: string }[]> = {
  recognition: [
    { role: 'Pediatrician / evaluator', contribution: 'Guides screening and the diagnostic process.' },
    { role: 'Early Intervention coordinator', contribution: 'Connects you to free early services.' },
  ],
  early: [
    { role: 'Speech / OT therapist', contribution: 'Builds communication and daily-living skills.' },
    { role: 'Early Intervention coordinator', contribution: 'Coordinates the IFSP and services.' },
  ],
  school: [
    { role: 'Special education teacher', contribution: 'Leads the IEP team and tracks goals at school.' },
    { role: 'Parent advocate', contribution: 'Joins key meetings and helps you prepare and follow up.' },
    { role: 'Therapist', contribution: 'Supports skills that carry beyond the classroom.' },
  ],
  transition: [
    { role: 'Special education teacher', contribution: 'Leads the IEP team and tracks transition goals.' },
    { role: 'Transition coordinator', contribution: 'Maps adult services, waitlists, and the VR application.' },
    { role: 'Special-needs attorney', contribution: 'Advises on age-18 decisions and future planning.' },
    { role: 'Adult services contact', contribution: 'To be added once a waiver coordinator is assigned.' },
  ],
  adult: [
    { role: 'Support coordinator', contribution: 'Coordinates adult services and the ISP.' },
    { role: 'Employment specialist', contribution: 'Job matching and on-the-job coaching.' },
  ],
}

export default function FamilyCircle() {
  const { state } = useFamily()
  const { child, parent } = state
  const age = getAge(child)
  const stageId = stageIdForAge(age)

  // Team-gap intelligence: the right partner at the right moment.
  const attorneyGap =
    stageId === 'transition' &&
    age >= 15 &&
    !state.checks['c18a'] &&
    !(state.isDemo && familyMembers.some((m) => m.roleId === 'attorney'))
  const m18 = keyMoments(child).find((m) => m.id === 'm18')

  // The demo family has a full roster; a new family starts with the parent at
  // the center plus the open slots that matter most for their stage.
  const members: FamilyMember[] = state.isDemo
    ? familyMembers
    : [
        {
          id: 'you',
          name: parent.name,
          role: `${parent.relationship}`,
          roleId: 'parent',
          contribution: 'Holds the big picture, schedules meetings, keeps the records.',
          status: 'core',
          initials: initials(parent.name),
          accent: 'teal',
          lastTouch: 'Today',
        },
        ...(suggestedRolesByStage[stageId] ?? suggestedRolesByStage.transition).map((s, i) => ({
          id: `open-${i}`,
          name: `Open — ${s.role}`,
          role: s.role,
          roleId: 'open',
          contribution: s.contribution,
          status: 'occasional' as const,
          initials: '+',
          accent: (['sage', 'lav', 'amber', 'rose'] as const)[i % 4],
          lastTouch: 'Not yet connected',
        })),
      ]

  const connected = members.filter((m) => m.initials !== '+').length
  const activity = state.isDemo ? familyActivity : []

  return (
    <div className="space-y-7">
      <PageHeader
        eyebrow="It takes a coordinated team"
        title="Family Circle"
        subtitle={`The people walking alongside ${firstName(child.name)} — and how everyone’s contribution fits together. You’re the coordinator; this keeps the whole team in view.`}
        icon={<Users className="h-6 w-6" />}
        action={
          <button className="btn-primary">
            <UserPlus className="h-4 w-4" /> Invite someone
          </button>
        }
      />

      {/* Team-gap intelligence */}
      {attorneyGap && (
        <AiNote title="A partner worth adding soon">
          There’s no special-needs attorney in {firstName(child.name)}’s circle yet, and the
          decision-making question is still open{m18 && <> — with the 18th birthday on {m18.dateLabel}</>}.
          Families usually start that conversation around 16, because courts and paperwork take
          months. The Resource Navigator has a matched attorney listing when you’re ready.
        </AiNote>
      )}

      {/* The circle visual */}
      <Card className="bg-gradient-to-br from-teal-50/60 to-surface">
        <div className="grid items-center gap-8 md:grid-cols-[auto_1fr]">
          {/* center = child, ring = team */}
          <div className="relative mx-auto h-64 w-64">
            {/* concentric rings */}
            <div className="absolute inset-0 rounded-full border border-teal-100" />
            <div className="absolute inset-8 rounded-full border border-teal-100" />
            {/* center */}
            <div className="absolute left-1/2 top-1/2 flex h-24 w-24 -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-full bg-teal-500 text-white shadow-lift">
              <span className="text-lg font-semibold">{initials(child.name)}</span>
              <span className="text-[10px] opacity-90">{firstName(child.name)}</span>
            </div>
            {/* members around */}
            {members.slice(0, 8).map((m, i, arr) => {
              const angle = (i / arr.length) * 2 * Math.PI - Math.PI / 2
              const radius = 108
              const x = 50 + (radius / 256) * 100 * Math.cos(angle)
              const y = 50 + (radius / 256) * 100 * Math.sin(angle)
              return (
                <div
                  key={m.id}
                  className={cx(
                    'absolute flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full text-xs font-semibold shadow-soft ring-2 ring-surface',
                    accentChip[m.accent],
                    m.initials === '+' && 'border border-dashed border-current opacity-70',
                  )}
                  style={{ left: `${x}%`, top: `${y}%` }}
                  title={`${m.name} · ${m.role}`}
                >
                  {m.initials}
                </div>
              )
            })}
          </div>

          <div>
            <h2 className="section-title text-xl font-semibold">
              {connected > 1 ? `A coordinated team of ${connected}` : 'Your team starts with you'}
            </h2>
            <p className="mt-2 max-w-lg text-ink-soft">
              Raising a child through these stages means working with many people at once — school,
              therapy, legal, and adult services. The Family Circle shows who’s involved, what they
              contribute, and where you might still need to add a partner.
            </p>
            <div className="mt-4 flex flex-wrap gap-4 text-sm">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-teal-500" />
                <span className="text-ink-soft">{members.filter((m) => m.status === 'core').length} core</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-sage-500" />
                <span className="text-ink-soft">{members.filter((m) => m.status === 'active').length} active</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-amber-400" />
                <span className="text-ink-soft">
                  {members.filter((m) => m.status === 'occasional').length} as needed
                </span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid gap-5 lg:grid-cols-3">
        {/* Member list */}
        <div className="space-y-4 lg:col-span-2">
          <h2 className="section-title text-lg font-semibold">The team</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {members.map((m) => {
              const isOpen = m.initials === '+'
              return (
                <Card
                  key={m.id}
                  className={cx('card-hover flex gap-3', isOpen && 'border-dashed bg-canvas/40')}
                >
                  <div
                    className={cx(
                      'flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-sm font-semibold',
                      accentChip[m.accent],
                    )}
                  >
                    {m.initials}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate font-semibold text-ink">{m.name}</p>
                      <span className={cx('h-2 w-2 shrink-0 rounded-full', accentSolid[m.accent])} />
                    </div>
                    <p className="text-xs font-medium text-ink-soft">{m.role}</p>
                    <p className="mt-1.5 text-sm leading-snug text-ink-soft">{m.contribution}</p>
                    <div className="mt-2 flex items-center justify-between">
                      <span className={cx('chip', accentChip[m.accent])}>{statusLabel[m.status]}</span>
                      <span className="inline-flex items-center gap-1 text-xs text-ink-faint">
                        <Clock className="h-3 w-3" /> {m.lastTouch}
                      </span>
                    </div>
                    {!isOpen && (
                      <div className="mt-3 flex gap-2 border-t border-line pt-3">
                        <button className="inline-flex items-center gap-1 text-xs font-semibold text-teal-600 hover:underline">
                          <MessageSquare className="h-3.5 w-3.5" /> Message
                        </button>
                        <button className="inline-flex items-center gap-1 text-xs font-semibold text-teal-600 hover:underline">
                          <CalendarDays className="h-3.5 w-3.5" /> Schedule
                        </button>
                      </div>
                    )}
                  </div>
                </Card>
              )
            })}
          </div>
        </div>

        {/* Activity feed */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-teal-600" />
            <h2 className="section-title text-lg font-semibold">Recent coordination</h2>
          </div>
          <Card className="p-0">
            {activity.length === 0 ? (
              <EmptyState
                icon={<Activity className="h-5 w-5" />}
                title="No coordination yet"
                body="As your team grows, shared updates and meeting notes will appear here — one picture everyone can see."
              />
            ) : (
              <ul className="divide-y divide-line">
                {activity.map((a) => (
                  <li key={a.id} className="flex gap-3 p-4">
                    <span className={cx('mt-1.5 h-2 w-2 shrink-0 rounded-full', accentSolid[a.accent])} />
                    <div>
                      <p className="text-sm text-ink">
                        <span className={cx('font-semibold', accentText[a.accent])}>{a.who}</span> {a.what}
                      </p>
                      <p className="text-xs text-ink-faint">{a.when}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Card>
          <div className="rounded-2xl bg-gradient-to-br from-amber-50 to-surface p-5">
            <p className="font-semibold text-ink">One shared picture</p>
            <p className="mt-1 text-sm text-ink-soft">
              When everyone sees the same plan, fewer things fall through the cracks — and you carry
              less of it alone.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
