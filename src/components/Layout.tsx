import { useEffect, useRef, useState, type RefObject } from 'react'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  Map,
  Compass,
  MessageCircleHeart,
  FolderHeart,
  LifeBuoy,
  Users,
  Menu,
  X,
  ChevronRight,
  Sparkles,
  RotateCcw,
  Telescope,
  History,
  Download,
  LogOut,
  Trash2,
  CloudOff,
  FileText,
  ClipboardList,
  ShieldCheck,
} from 'lucide-react'
import { cx } from '../lib/cx'
import { apiDeleteAccount, exportUrl } from '../api'
import { Modal } from './ui'
import { useAuth } from '../store/AuthContext'
import { useFamily } from '../store/FamilyContext'
import { firstName, getAge, initials, stageIdForAge } from '../store/selectors'
import { journeyStages } from '../data/journey'

const navGroups = [
  {
    label: null,
    items: [{ to: '/', label: 'Home', icon: LayoutDashboard, end: true }],
  },
  {
    label: 'Your journey',
    items: [
      { to: '/journey', label: 'Journey Map', icon: Map },
      { to: '/look-ahead', label: 'Look Ahead', icon: Telescope },
      { to: '/timeline', label: 'Family Timeline', icon: History },
      { to: '/transition', label: 'Transition Navigator', icon: Compass },
    ],
  },
  {
    label: 'Everyday tools',
    items: [
      { to: '/companion', label: 'Your Navigator', icon: MessageCircleHeart },
      { to: '/documents', label: 'Family Vault', icon: FolderHeart },
      { to: '/resources', label: 'Resource Navigator', icon: LifeBuoy },
    ],
  },
  {
    label: 'Share & prepare',
    items: [
      { to: '/summary', label: 'Family Summary', icon: FileText },
      { to: '/meeting-prep', label: 'Meeting Prep', icon: ClipboardList },
    ],
  },
  {
    label: 'Your team',
    items: [{ to: '/family', label: 'Family Circle', icon: Users }],
  },
  {
    label: 'Your data',
    items: [{ to: '/trust', label: 'Trust & Data', icon: ShieldCheck }],
  },
]

// The mobile drawer is a plain table of contents — the same destinations as the
// desktop sidebar, grouped and ordered for a single top-to-bottom read. It has no
// reassurance card and no pinned footer: everything, including the account row,
// lives in one natural scroll. Destructive and secondary account actions (export,
// delete, reset, storage) live inside Trust & Data, which the account row links to.
const mobileNavGroups = [
  { label: null, items: [{ to: '/', label: 'Home', icon: LayoutDashboard, end: true }] },
  {
    label: 'Your Journey',
    items: [
      { to: '/journey', label: 'Journey Map', icon: Map },
      { to: '/look-ahead', label: 'Look Ahead', icon: Telescope },
      { to: '/timeline', label: 'Family Timeline', icon: History },
      { to: '/transition', label: 'Transition Navigator', icon: Compass },
    ],
  },
  {
    label: 'Tools',
    items: [
      { to: '/companion', label: 'Your Navigator', icon: MessageCircleHeart },
      { to: '/documents', label: 'Family Vault', icon: FolderHeart },
      { to: '/resources', label: 'Resource Navigator', icon: LifeBuoy },
    ],
  },
  {
    label: 'Share & Prepare',
    items: [
      { to: '/summary', label: 'Family Summary', icon: FileText },
      { to: '/meeting-prep', label: 'Meeting Prep', icon: ClipboardList },
    ],
  },
  { label: 'Your Team', items: [{ to: '/family', label: 'Family Circle', icon: Users }] },
]

// Rows are a uniform ~48px tall with one icon size and alignment, so the drawer
// reads as a calm list rather than a set of mismatched controls.
const rowBase =
  'flex min-h-[48px] items-center gap-3 rounded-xl px-3 text-sm font-medium transition-colors'
const navRowClass = ({ isActive }: { isActive: boolean }) =>
  cx(rowBase, isActive ? 'bg-teal-50 text-teal-700' : 'text-ink-soft hover:bg-canvas active:bg-canvas')

function MobileNav({
  onNavigate,
  onClose,
  closeRef,
}: {
  onNavigate: () => void
  onClose: () => void
  closeRef: RefObject<HTMLButtonElement>
}) {
  const { state, flush } = useFamily()
  const { logout } = useAuth()
  const navigate = useNavigate()
  const age = getAge(state.child)
  const inTransition = stageIdForAge(age) === 'transition'
  const childFirst = firstName(state.child.name)

  const signOut = async () => {
    const saved = await flush()
    if (!saved && !window.confirm('We couldn’t save your most recent change yet. Sign out anyway?')) {
      return
    }
    onNavigate()
    await logout()
    navigate('/auth')
  }

  return (
    <>
      {/* Brand header — scrolls with the list; no sticky regions. */}
      <div className="flex items-center gap-3 px-4 pb-1 pt-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-500 text-white shadow-soft">
          <Compass className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1 leading-tight">
          <p className="font-display text-base font-semibold text-ink">Family Navigator</p>
          <p className="text-xs text-ink-faint">See the road ahead</p>
        </div>
        <button
          ref={closeRef}
          onClick={onClose}
          aria-label="Close menu"
          className="-mr-1 shrink-0 rounded-lg p-2 text-ink-soft hover:bg-canvas"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <nav className="px-2 pt-1" aria-label="Main navigation">
        {mobileNavGroups.map((group, gi) => (
          <div key={group.label ?? gi} className="pt-2 first:pt-0">
            {group.label && (
              <p className="mb-1 rounded-lg bg-line/50 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-widest text-ink-faint">
                {group.label}
              </p>
            )}
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const Icon = item.icon
                const showBadge = item.to === '/transition' && inTransition
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={'end' in item ? item.end : undefined}
                    onClick={onNavigate}
                    className={navRowClass}
                  >
                    {({ isActive }) => (
                      <>
                        <Icon className={cx('h-5 w-5 shrink-0', isActive ? 'text-teal-600' : 'text-ink-faint')} />
                        <span className="min-w-0 flex-1 truncate">{item.label}</span>
                        {showBadge && (
                          <span className="shrink-0 rounded-full bg-lav-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-lav-600">
                            Now
                          </span>
                        )}
                      </>
                    )}
                  </NavLink>
                )
              })}
            </div>
          </div>
        ))}

        {/* Account & Data — clean full-width rows, not a crowded footer block.
            Delete/reset/storage/profile all live one tap away in Trust & Data. */}
        <div className="pt-2">
          <p className="mb-1 rounded-lg bg-line/50 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-widest text-ink-faint">
            Account &amp; Data
          </p>
          <div className="space-y-0.5">
            <NavLink to="/trust" onClick={onNavigate} className={navRowClass}>
              {({ isActive }) => (
                <>
                  <ShieldCheck className={cx('h-5 w-5 shrink-0', isActive ? 'text-teal-600' : 'text-ink-faint')} />
                  <span className="min-w-0 flex-1 truncate">Trust &amp; Data</span>
                </>
              )}
            </NavLink>
            <a href={exportUrl} onClick={onNavigate} className={cx(rowBase, 'text-ink-soft hover:bg-canvas')}>
              <Download className="h-5 w-5 shrink-0 text-ink-faint" />
              <span className="min-w-0 flex-1 truncate">Export family record</span>
            </a>
            <button onClick={signOut} className={cx(rowBase, 'w-full text-left text-ink-soft hover:bg-canvas')}>
              <LogOut className="h-5 w-5 shrink-0 text-ink-faint" />
              <span className="min-w-0 flex-1 truncate">Sign out</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Compact account row at the bottom of the flow → Account settings (Trust & Data). */}
      <div className="mt-auto px-2 pb-2 pt-3">
        <Link
          to="/trust"
          onClick={onNavigate}
          className="flex items-center gap-3 rounded-xl border border-line bg-canvas/60 px-3 py-2.5 transition-colors hover:bg-canvas"
          aria-label="Account settings"
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-100 text-sm font-semibold text-amber-600">
            {initials(state.parent.name) || '?'}
          </div>
          <div className="min-w-0 flex-1 leading-tight">
            <p className="truncate text-sm font-semibold text-ink">{state.parent.name || 'Your account'}</p>
            <p className="truncate text-xs text-ink-faint">
              Caring for {childFirst}
              {state.isDemo && ' · sample family'}
            </p>
          </div>
          <ChevronRight className="h-4 w-4 shrink-0 text-ink-faint" />
        </Link>
      </div>
    </>
  )
}

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const { state, flush, resetRecord } = useFamily()
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const age = getAge(state.child)
  const inTransition = stageIdForAge(age) === 'transition'

  const startOver = async () => {
    if (
      window.confirm(
        'Start over with a fresh record? Your current setup and progress will be cleared from your account.',
      )
    ) {
      try {
        await resetRecord()
        navigate('/welcome')
      } catch {
        window.alert('We couldn’t reach the server just now, so nothing was cleared. Please try again.')
      }
    }
  }

  const signOut = async () => {
    // Push any unsaved change first so signing out never drops it.
    const saved = await flush()
    if (
      !saved &&
      !window.confirm('We couldn’t save your most recent change yet. Sign out anyway?')
    ) {
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
    <div className="flex h-full flex-col">
      {/* Brand */}
      <div className="flex items-center gap-3 px-6 py-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-500 text-white shadow-soft">
          <Compass className="h-5 w-5" />
        </div>
        <div className="leading-tight">
          <p className="font-display text-lg font-semibold text-ink">Family Navigator</p>
          <p className="text-xs text-ink-faint">See the road ahead</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-4 overflow-y-auto px-3" aria-label="Main navigation">
        {navGroups.map((group, gi) => (
          <div key={group.label ?? gi}>
            {group.label && (
              <p className="mb-1 px-3 text-[11px] font-semibold uppercase tracking-wider text-ink-faint">
                {group.label}
              </p>
            )}
            <div className="space-y-1">
              {group.items.map((item) => {
                const Icon = item.icon
                const showBadge = item.to === '/transition' && inTransition
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={'end' in item ? item.end : undefined}
                    onClick={onNavigate}
                    className={({ isActive }) =>
                      cx(
                        'group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
                        isActive
                          ? 'bg-teal-50 text-teal-700'
                          : 'text-ink-soft hover:bg-canvas hover:text-ink',
                      )
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <Icon
                          className={cx(
                            'h-5 w-5 shrink-0',
                            isActive ? 'text-teal-600' : 'text-ink-faint group-hover:text-ink-soft',
                          )}
                        />
                        <span className="flex-1">{item.label}</span>
                        {showBadge && (
                          <span className="rounded-full bg-lav-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-lav-600">
                            Now
                          </span>
                        )}
                      </>
                    )}
                  </NavLink>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Reassurance card */}
      <div className="m-3 rounded-2xl bg-gradient-to-br from-teal-50 to-sage-50 p-4">
        <div className="flex items-center gap-2 text-teal-700">
          <Sparkles className="h-4 w-4" />
          <p className="text-sm font-semibold">You’re not alone</p>
        </div>
        <p className="mt-1.5 text-xs leading-relaxed text-ink-soft">
          You don’t have to figure out the whole road today. We’ll keep what matters in view, one
          step at a time.
        </p>
      </div>

      {/* Family chip + account actions */}
      <div className="border-t border-line px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-100 text-sm font-semibold text-amber-600">
            {initials(state.parent.name) || '?'}
          </div>
          <div className="min-w-0 flex-1 leading-tight">
            <p className="truncate text-sm font-semibold text-ink">{state.parent.name}</p>
            <p className="truncate text-xs text-ink-faint">
              Caring for {firstName(state.child.name)}
              {state.isDemo && ' · sample family'}
            </p>
          </div>
          <button
            onClick={startOver}
            className="rounded-lg p-2 text-ink-faint hover:bg-canvas hover:text-ink-soft"
            title="Start over with a fresh record"
            aria-label="Start over with a fresh record"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
        </div>
        {user && (
          <>
            <div className="mt-2 flex items-center justify-between gap-2 pl-12 text-xs">
              <span className="truncate text-ink-faint" title={user.email}>{user.email}</span>
              <div className="flex shrink-0 items-center gap-1">
                <a
                  href={exportUrl}
                  className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-ink-faint hover:bg-canvas hover:text-ink-soft"
                  title="Export all your data"
                >
                  <Download className="h-3.5 w-3.5" /> Export
                </a>
                <button
                  onClick={signOut}
                  className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-ink-faint hover:bg-canvas hover:text-ink-soft"
                >
                  <LogOut className="h-3.5 w-3.5" /> Sign out
                </button>
              </div>
            </div>
            <div className="mt-1 flex justify-end text-xs">
              <button
                onClick={() => setConfirmDelete(true)}
                className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-ink-faint hover:bg-rose-50 hover:text-rose-500"
              >
                <Trash2 className="h-3.5 w-3.5" /> Delete account
              </button>
            </div>
            <Modal
              open={confirmDelete}
              onClose={() => setConfirmDelete(false)}
              title="Delete your account?"
            >
              <p className="mt-3 text-sm leading-relaxed text-ink-soft">
                This permanently erases your account, your family record, and every document
                you’ve stored here. There’s no way to undo it. If you’d like a copy first, you
                can export your data before deleting.
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
          </>
        )}
      </div>
    </div>
  )
}

export default function Layout() {
  const [open, setOpen] = useState(false)
  const location = useLocation()
  const { state, saveStatus } = useFamily()
  const [conflictNotice, setConflictNotice] = useState(false)
  const menuButtonRef = useRef<HTMLButtonElement>(null)
  const drawerCloseRef = useRef<HTMLButtonElement>(null)
  const wasOpenRef = useRef(false)
  const age = getAge(state.child)
  const stage = journeyStages.find((s) => s.id === stageIdForAge(age))

  // Each page starts at the top — navigating shouldn't inherit scroll position.
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [location.pathname])

  // Close the mobile drawer with Escape.
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open])

  // Lock the page behind the drawer so it can't scroll underneath, and restore
  // exactly what was there on close. We lock the <html> element (the real scroll
  // container) as well as <body>; overflow:hidden (not position:fixed) keeps the
  // scroll position intact, so opening and closing never jump the page. Mobile
  // uses overlay scrollbars, so hiding overflow reclaims no width and can't shift
  // the layout — and the drawer only ever opens below the lg breakpoint.
  useEffect(() => {
    if (!open) return
    const root = document.documentElement
    const prevRoot = root.style.overflow
    const prevBody = document.body.style.overflow
    root.style.overflow = 'hidden'
    document.body.style.overflow = 'hidden'
    return () => {
      root.style.overflow = prevRoot
      document.body.style.overflow = prevBody
    }
  }, [open])

  // Move focus into the drawer when it opens; hand it back to the hamburger
  // when it closes (but never steal focus on first render).
  useEffect(() => {
    if (open) {
      wasOpenRef.current = true
      drawerCloseRef.current?.focus()
    } else if (wasOpenRef.current) {
      wasOpenRef.current = false
      menuButtonRef.current?.focus()
    }
  }, [open])

  // A cross-device conflict shows a brief, dismissible notice.
  useEffect(() => {
    if (saveStatus === 'conflict') setConflictNotice(true)
  }, [saveStatus])

  return (
    <div className="min-h-screen bg-canvas">
      <a
        href="#main"
        className="sr-only z-50 focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:rounded-xl focus:bg-teal-600 focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white"
      >
        Skip to content
      </a>

      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 hidden w-72 border-r border-line bg-surface lg:block">
        <SidebarContent />
      </aside>

      {/* Mobile drawer — one scroll surface, sized in dvh so it stays put when the
          browser chrome expands or collapses. The drawer remounts on every open,
          so it always starts at the top rather than a stale scroll position. */}
      {open && (
        <div className="fixed inset-x-0 top-0 z-40 lg:hidden" style={{ height: '100dvh' }}>
          <div className="absolute inset-0 bg-ink/40 animate-fade-in" onClick={() => setOpen(false)} aria-hidden />
          <aside
            role="dialog"
            aria-modal="true"
            aria-label="Navigation menu"
            className="absolute left-0 top-0 flex h-full w-[90vw] max-w-[360px] flex-col overflow-y-auto overscroll-contain bg-surface pb-[env(safe-area-inset-bottom)] shadow-lift animate-fade-in [-webkit-overflow-scrolling:touch]"
          >
            <MobileNav
              onNavigate={() => setOpen(false)}
              onClose={() => setOpen(false)}
              closeRef={drawerCloseRef}
            />
          </aside>
        </div>
      )}

      {/* Main column */}
      <div className="lg:pl-72">
        {/* Top bar with persistent child context — always answers "where am I?" */}
        <header className="sticky top-0 z-30 border-b border-line bg-canvas/85 backdrop-blur">
          {state.isDemo && (
            <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 border-b border-line bg-lav-50 px-4 py-2 text-xs text-lav-600 sm:text-sm">
              <span>You’re exploring the sample family.</span>
              <Link
                to="/welcome"
                className="shrink-0 font-semibold underline underline-offset-2 hover:text-lav-500"
              >
                Set up your real family
              </Link>
            </div>
          )}
          {saveStatus === 'error' && (
            <div
              role="status"
              className="flex flex-wrap items-center justify-center gap-2 border-b border-line bg-amber-50 px-4 py-2 text-xs text-ink-soft sm:text-sm"
            >
              <CloudOff className="h-4 w-4 shrink-0 text-amber-600" aria-hidden />
              <span>
                We can’t reach the server right now — your recent changes aren’t saved yet. We’ll
                keep trying.
              </span>
            </div>
          )}
          {conflictNotice && (
            <div
              role="status"
              className="flex flex-wrap items-center justify-center gap-2 border-b border-line bg-teal-50 px-4 py-2 text-xs text-ink-soft sm:text-sm"
            >
              <span>Your record was updated from another device — showing the latest version.</span>
              <button
                onClick={() => setConflictNotice(false)}
                className="rounded-lg p-1 text-ink-faint hover:bg-teal-100 hover:text-ink-soft"
                aria-label="Dismiss notice"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
          <div className="flex items-center gap-3 px-4 py-3 sm:px-8">
            <button
              ref={menuButtonRef}
              className="rounded-lg p-2 text-ink-soft hover:bg-surface lg:hidden"
              onClick={() => setOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>

            <div className="flex flex-1 items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-teal-100 font-semibold text-teal-700">
                {initials(state.child.name) || '·'}
              </div>
              <div className="leading-tight">
                <p className="text-sm font-semibold text-ink">
                  {state.child.name} <span className="font-normal text-ink-faint">· age {age}</span>
                </p>
                <p className="text-xs text-ink-faint">
                  Current stage:{' '}
                  <Link to="/journey" className="font-medium text-lav-600 hover:underline">
                    {stage?.title ?? '—'}
                  </Link>
                </p>
              </div>
            </div>

            <span className="hidden rounded-full bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-600 sm:inline-flex">
              XPRIZE Prototype
            </span>
          </div>
        </header>

        <main id="main" key={location.pathname} className="mx-auto max-w-6xl animate-fade-in px-4 py-7 sm:px-8 sm:py-9">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
