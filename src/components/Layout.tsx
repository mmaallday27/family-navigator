import { useEffect, useState } from 'react'
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
  Sparkles,
  RotateCcw,
  Telescope,
  History,
} from 'lucide-react'
import { cx } from '../lib/cx'
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
      { to: '/documents', label: 'Document Vault', icon: FolderHeart },
      { to: '/resources', label: 'Resource Navigator', icon: LifeBuoy },
    ],
  },
  {
    label: 'Your team',
    items: [{ to: '/family', label: 'Family Circle', icon: Users }],
  },
]

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const { state, dispatch } = useFamily()
  const navigate = useNavigate()
  const age = getAge(state.child)
  const inTransition = stageIdForAge(age) === 'transition'

  const startOver = () => {
    if (
      window.confirm(
        'Start over with a different family? Your current setup and progress on this device will be cleared.',
      )
    ) {
      dispatch({ type: 'reset' })
      navigate('/welcome')
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

      {/* Family chip */}
      <div className="flex items-center gap-3 border-t border-line px-6 py-4">
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
          title="Start over with a different family"
          aria-label="Start over with a different family"
        >
          <RotateCcw className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}

export default function Layout() {
  const [open, setOpen] = useState(false)
  const location = useLocation()
  const { state } = useFamily()
  const age = getAge(state.child)
  const stage = journeyStages.find((s) => s.id === stageIdForAge(age))

  // Close the mobile drawer with Escape.
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open])

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

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-40 lg:hidden" role="dialog" aria-modal="true" aria-label="Navigation menu">
          <div className="absolute inset-0 bg-ink/20" onClick={() => setOpen(false)} aria-hidden />
          <aside className="absolute inset-y-0 left-0 w-72 bg-surface shadow-lift animate-fade-in">
            <button
              className="absolute right-3 top-3 z-10 rounded-lg p-2 text-ink-soft hover:bg-canvas"
              onClick={() => setOpen(false)}
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </button>
            <SidebarContent onNavigate={() => setOpen(false)} />
          </aside>
        </div>
      )}

      {/* Main column */}
      <div className="lg:pl-72">
        {/* Top bar with persistent child context — always answers "where am I?" */}
        <header className="sticky top-0 z-30 border-b border-line bg-canvas/85 backdrop-blur">
          <div className="flex items-center gap-3 px-4 py-3 sm:px-8">
            <button
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
