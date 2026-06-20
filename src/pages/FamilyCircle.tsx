import {
  Users,
  UserPlus,
  Activity,
  MessageSquare,
  CalendarDays,
  Clock,
} from 'lucide-react'
import { PageHeader, Card } from '../components/ui'
import { familyMembers, familyActivity } from '../data/family'
import { child } from '../data/profile'
import { cx, accentChip, accentSolid, accentText } from '../lib/cx'

const statusLabel: Record<string, string> = {
  core: 'Core circle',
  active: 'Active now',
  occasional: 'As needed',
}

export default function FamilyCircle() {
  const connected = familyMembers.filter((m) => m.initials !== '+').length

  return (
    <div className="space-y-7">
      <PageHeader
        eyebrow="It takes a coordinated team"
        title="Family Circle"
        subtitle={`The people walking alongside ${child.name.split(' ')[0]} — and how everyone’s contribution fits together. You’re the coordinator; this keeps the whole team in view.`}
        icon={<Users className="h-6 w-6" />}
        action={
          <button className="btn-primary">
            <UserPlus className="h-4 w-4" /> Invite someone
          </button>
        }
      />

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
              <span className="text-lg font-semibold">{child.name.split(' ').map((n) => n[0]).join('')}</span>
              <span className="text-[10px] opacity-90">{child.name.split(' ')[0]}</span>
            </div>
            {/* members around */}
            {familyMembers.slice(0, 8).map((m, i) => {
              const angle = (i / 8) * 2 * Math.PI - Math.PI / 2
              const radius = 108
              const x = 50 + (radius / 256) * 100 * Math.cos(angle)
              const y = 50 + (radius / 256) * 100 * Math.sin(angle)
              return (
                <div
                  key={m.id}
                  className={cx(
                    'absolute flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full text-xs font-semibold shadow-soft ring-2 ring-surface',
                    accentChip[m.accent],
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
            <h2 className="section-title text-xl font-semibold">A coordinated team of {connected}</h2>
            <p className="mt-2 max-w-lg text-ink-soft">
              Raising a child through these stages means working with many people at once — school,
              therapy, legal, and adult services. The Family Circle shows who’s involved, what they
              contribute, and where you might still need to add a partner.
            </p>
            <div className="mt-4 flex flex-wrap gap-4 text-sm">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-teal-500" />
                <span className="text-ink-soft">{familyMembers.filter((m) => m.status === 'core').length} core</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-sage-500" />
                <span className="text-ink-soft">{familyMembers.filter((m) => m.status === 'active').length} active</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-amber-400" />
                <span className="text-ink-soft">
                  {familyMembers.filter((m) => m.status === 'occasional').length} as needed
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
            {familyMembers.map((m) => {
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
            <ul className="divide-y divide-line">
              {familyActivity.map((a) => (
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
