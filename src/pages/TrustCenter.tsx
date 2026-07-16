// The Trust & Data Control Center — "your data, in plain words." Every number
// on this page is read live from the family record, so it is always TRUE for
// this family, never marketing. The controls are real working affordances
// (export, sign out, delete account), not promises.

import { useState, type ReactNode } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ShieldCheck,
  User,
  MapPin,
  Target,
  FolderHeart,
  MessageCircleHeart,
  ListChecks,
  History,
  Download,
  Pencil,
  HardDrive,
  LogOut,
  Trash2,
  FileSearch,
  BadgeCheck,
  Lightbulb,
  Stethoscope,
  ArrowRight,
  type LucideIcon,
} from 'lucide-react'
import { Card, Modal, PageHeader } from '../components/ui'
import { SourceBadge } from '../components/ai'
import { useFamily } from '../store/FamilyContext'
import { useAuth } from '../store/AuthContext'
import { apiDeleteAccount, exportUrl } from '../api'

/** "3 goals", "1 document" — plain counting, no marketing rounding. */
function count(n: number, word: string): string {
  return `${n} ${word}${n === 1 ? '' : 's'}`
}

/** "March 2011" from an ISO birth date (we only ever ask for month + year). */
function birthLabel(iso: string): string {
  if (!iso) return ''
  const [y, m] = iso.split('-')
  const d = new Date(Number(y), Number(m) - 1, 1)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
}

function DataRow({
  icon: Icon,
  label,
  value,
  why,
}: {
  icon: LucideIcon
  label: string
  value: string
  why: string
}) {
  return (
    <li className="flex items-start gap-3 py-3.5 first:pt-0 last:pb-0">
      <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-canvas text-ink-faint">
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5">
          <p className="font-medium text-ink">{label}</p>
          <p className="text-sm text-teal-700">{value}</p>
        </div>
        <p className="mt-0.5 text-sm leading-relaxed text-ink-soft">{why}</p>
      </div>
    </li>
  )
}

function SourceLegendRow({ badge, meaning }: { badge: ReactNode; meaning: string }) {
  return (
    <li className="flex flex-col gap-1.5 py-3 first:pt-0 last:pb-0 sm:flex-row sm:items-start sm:gap-4">
      <div className="w-56 shrink-0">{badge}</div>
      <p className="text-sm leading-relaxed text-ink-soft">{meaning}</p>
    </li>
  )
}

export default function TrustCenter() {
  const { state, flush } = useFamily()
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const { child, parent, location, goals, documents, activity, aiMemory } = state
  const stepsDone = Object.values(state.checks).filter(Boolean).length
  const locationParts = [location.state, location.county, location.zip].filter(Boolean)

  const profileBits = [
    child.name && `${child.name}${parent.name ? ` and ${parent.name}` : ''}`,
    child.birthDate && `born ${birthLabel(child.birthDate)}`,
    child.diagnosis || 'diagnosis not shared',
  ].filter(Boolean)

  const signOut = async () => {
    // Push any unsaved change first so signing out never drops it.
    const saved = await flush()
    if (!saved && !window.confirm('We couldn’t save your most recent change yet. Sign out anyway?')) {
      return
    }
    await logout()
    navigate('/auth')
  }

  const deleteAccount = async () => {
    setDeleting(true)
    try {
      await apiDeleteAccount()
      await logout()
      navigate('/auth')
    } catch {
      setDeleting(false)
      window.alert(
        'We couldn’t reach the server, so nothing was deleted. Your account is untouched — please try again.',
      )
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-7">
      <PageHeader
        eyebrow="Trust & data"
        title="Your data, in plain words"
        subtitle="Exactly what this platform holds for your family, what the AI can use, and the controls you have over all of it. No legal maze — just the truth."
        icon={<ShieldCheck className="h-6 w-6" />}
      />

      <p className="rounded-2xl bg-amber-50 px-4 py-3 text-sm leading-relaxed text-ink-soft">
        Family Navigator is a <span className="font-semibold text-ink">pilot</span>. We tell you
        exactly what we do with your information instead of hiding behind fine print — and if
        anything on this page ever stops being true, we change the product or this page, never
        just the wording.
      </p>

      {/* ---- 1. What Family Navigator knows ---- */}
      <section>
        <h2 className="section-title text-lg font-semibold">What Family Navigator knows</h2>
        <p className="mt-1 text-sm text-ink-soft">
          These are live numbers from your record, right now — not examples.
          {state.isDemo &&
            ' You’re exploring the sample family, so they describe the sample record, not real data.'}
        </p>
        <Card className="mt-3">
          <ul className="divide-y divide-line">
            <DataRow
              icon={User}
              label="Family profile"
              value={profileBits.length > 0 ? profileBits.join(' · ') : 'Not shared yet'}
              why="Who your child is and who’s caring for them. Every date and milestone in the product is computed from the birth month and year you gave us."
            />
            <DataRow
              icon={MapPin}
              label="Location"
              value={locationParts.length > 0 ? locationParts.join(' · ') : 'Not shared'}
              why="State, county, and zip — only what you chose to tell us. It points guidance at your state’s agencies and programs instead of generic ones."
            />
            <DataRow
              icon={Target}
              label="Goals"
              value={count(goals.length, 'goal')}
              why="What your family is working toward, so the navigator can connect today’s steps to them."
            />
            <DataRow
              icon={FolderHeart}
              label="Documents"
              value={count(documents.length, 'document')}
              why="The files you’ve added to the Document Vault — IEPs, letters, evaluations. They stay yours: downloadable and deletable one by one."
            />
            <DataRow
              icon={MessageCircleHeart}
              label="Conversation memory"
              value={`${count(aiMemory.messages.length, 'saved message')} · ${count(aiMemory.topicsDiscussed.length, 'topic')}`}
              why="Your recent conversations with the navigator, so it can pick up where you left off instead of making you re-explain everything."
            />
            <DataRow
              icon={ListChecks}
              label="Journey progress"
              value={count(stepsDone, 'step') + ' checked off'}
              why="Which preparation steps you’ve completed, so progress and “what’s next” are real, not guesses."
            />
            <DataRow
              icon={History}
              label="Activity history"
              value={count(activity.length, 'recent event') + ' (we keep the most recent 50)'}
              why="A short trail of what you’ve done here — it powers “since your last visit” and the Family Timeline."
            />
          </ul>
        </Card>
      </section>

      {/* ---- 2. What the AI can use ---- */}
      <section>
        <h2 className="section-title text-lg font-semibold">What the AI can use</h2>
        <Card className="mt-3 space-y-3 text-sm leading-relaxed text-ink-soft">
          <p>
            When you ask the navigator a question or have a document analyzed, we send the relevant
            parts of your record — your family profile, your progress, document names and
            summaries, and the question itself — to our AI provider, Anthropic, to generate the
            answer. Only what’s needed for that one answer, nothing more.
          </p>
          <p>
            The connection to the AI runs entirely through our own server.{' '}
            <span className="font-medium text-ink">
              The AI key and your data never appear in your browser
            </span>{' '}
            beyond what you see on screen. Our AI provider does not train its models on this data.
          </p>
          <p>
            The AI can also be off entirely. When it is, a built-in guidance engine answers using
            only your record and the knowledge already inside the product — nothing leaves our
            server. You can always tell which one answered: the navigator shows a{' '}
            <span className="font-medium text-ink">“Live AI”</span> badge when the AI is on and a{' '}
            <span className="font-medium text-ink">“Guided”</span> badge when it isn’t.
          </p>
        </Card>
      </section>

      {/* ---- 3. Where an answer comes from ---- */}
      <section>
        <h2 className="section-title text-lg font-semibold">Where an answer comes from</h2>
        <p className="mt-1 text-sm text-ink-soft">
          Every answer in the product carries a label, so you always know what kind of thing you
          just read. Here’s what each one means.
        </p>
        <Card className="mt-3">
          <ul className="divide-y divide-line">
            <SourceLegendRow
              badge={<SourceBadge kind="record" />}
              meaning="Computed from your own data — names, dates, progress, documents. These are facts about your family, not general advice."
            />
            <SourceLegendRow
              badge={
                <span className="chip bg-sage-50 text-sage-600">
                  <FileSearch className="h-3 w-3" /> From this document
                </span>
              }
              meaning="Read directly from a file you uploaded. If it looks wrong, check the document itself — we quote it, we don’t improve it."
            />
            <SourceLegendRow
              badge={
                <span className="chip bg-teal-50 text-teal-700">
                  <BadgeCheck className="h-3 w-3" /> Verified source
                </span>
              }
              meaning="Comes with an official link and the date we last verified it, so you can go straight to the source."
            />
            <SourceLegendRow
              badge={<SourceBadge kind="educational" />}
              meaning="How the system usually works — timelines, typical steps, common patterns. True in general; always verify it for your state and your case."
            />
            <SourceLegendRow
              badge={
                <span className="chip bg-lav-50 text-lav-600">
                  <Lightbulb className="h-3 w-3" /> Beyond the document itself
                </span>
              }
              meaning="An inference or suggestion — the navigator connecting dots, not stating a fact. Treat it as a starting point for your own judgment."
            />
            <SourceLegendRow
              badge={
                <span className="chip bg-amber-50 text-amber-600">
                  <Stethoscope className="h-3 w-3" /> Bring this to a professional
                </span>
              }
              meaning="Legal, medical, and benefits decisions need a qualified human expert. We help you arrive prepared — we never replace them."
            />
          </ul>
        </Card>
      </section>

      {/* ---- 4. Your controls ---- */}
      <section>
        <h2 className="section-title text-lg font-semibold">Your controls</h2>
        <p className="mt-1 text-sm text-ink-soft">
          Your record belongs to you. Each of these works right now — they’re buttons, not
          promises.
        </p>
        <Card className="mt-3 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="font-medium text-ink">Export everything</p>
              <p className="text-sm text-ink-soft">
                One download with your whole record and every file you’ve stored — yours to keep,
                or to take somewhere else.
              </p>
            </div>
            <a href={exportUrl} className="btn-primary shrink-0">
              <Download className="h-4 w-4" /> Export my data
            </a>
          </div>

          <ul className="divide-y divide-line border-t border-line">
            <li className="flex flex-wrap items-center justify-between gap-2 py-3">
              <div className="flex items-center gap-2 text-sm text-ink">
                <FolderHeart className="h-4 w-4 text-ink-faint" /> Download or delete individual
                documents
              </div>
              <Link to="/documents" className="inline-flex items-center gap-1 text-sm font-semibold text-teal-600 hover:gap-2">
                Open the Vault <ArrowRight className="h-4 w-4 transition-all" />
              </Link>
            </li>
            <li className="flex flex-wrap items-center justify-between gap-2 py-3">
              <div className="flex items-center gap-2 text-sm text-ink">
                <Pencil className="h-4 w-4 text-ink-faint" /> Correct your family’s information
              </div>
              <Link to="/" className="inline-flex items-center gap-1 text-sm font-semibold text-teal-600 hover:gap-2">
                Edit the profile <ArrowRight className="h-4 w-4 transition-all" />
              </Link>
            </li>
            <li className="flex flex-wrap items-center justify-between gap-2 py-3">
              <div className="flex items-center gap-2 text-sm text-ink">
                <HardDrive className="h-4 w-4 text-ink-faint" /> See how much storage you’re using
              </div>
              <Link to="/documents" className="inline-flex items-center gap-1 text-sm font-semibold text-teal-600 hover:gap-2">
                Storage in the Vault <ArrowRight className="h-4 w-4 transition-all" />
              </Link>
            </li>
            <li className="flex flex-wrap items-center justify-between gap-2 py-3">
              <div className="flex items-center gap-2 text-sm text-ink">
                <LogOut className="h-4 w-4 text-ink-faint" /> Sign out of this device
              </div>
              <button onClick={signOut} className="btn-soft shrink-0 px-3 py-1.5 text-xs">
                Sign out
              </button>
            </li>
            {user && (
              <li className="flex flex-wrap items-center justify-between gap-2 py-3">
                <div className="flex items-center gap-2 text-sm text-ink">
                  <Trash2 className="h-4 w-4 text-ink-faint" /> Delete your account and everything
                  in it
                </div>
                <button
                  onClick={() => setConfirmDelete(true)}
                  className="btn shrink-0 bg-rose-50 px-3 py-1.5 text-xs text-rose-500 hover:bg-rose-100"
                >
                  Delete account
                </button>
              </li>
            )}
          </ul>

          <p className="rounded-xl bg-canvas px-4 py-3 text-xs leading-relaxed text-ink-faint">
            <span className="font-semibold text-ink-soft">How long we keep things:</span> your
            record stays until you delete it. When you delete, it’s gone from the live system
            immediately; encrypted backup snapshots age out within about two weeks.
          </p>
        </Card>
      </section>

      <p className="text-sm text-ink-soft">
        Want the fuller picture? Read our{' '}
        <Link to="/privacy" className="font-semibold text-teal-600 hover:underline">
          privacy explanation
        </Link>{' '}
        and the{' '}
        <Link to="/terms" className="font-semibold text-teal-600 hover:underline">
          terms of the pilot
        </Link>
        , both written the same way this page is — in plain words.
      </p>

      <Modal open={confirmDelete} onClose={() => setConfirmDelete(false)} title="Delete your account?">
        <p className="mt-3 text-sm leading-relaxed text-ink-soft">
          This permanently erases your account, your family record, and every document you’ve
          stored here. There’s no way to undo it. If you’d like a copy first, you can export your
          data before deleting.
        </p>
        <div className="mt-5 flex flex-wrap justify-end gap-2">
          <button className="btn-soft" onClick={() => setConfirmDelete(false)}>
            Keep my account
          </button>
          <button
            className="btn bg-rose-600 text-white hover:bg-rose-500"
            disabled={deleting}
            onClick={deleteAccount}
          >
            {deleting ? 'Deleting…' : 'Delete everything'}
          </button>
        </div>
      </Modal>
    </div>
  )
}
