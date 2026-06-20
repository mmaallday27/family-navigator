import { useState, type ReactNode } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
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
} from 'lucide-react'
import { cx } from '../lib/cx'
import { child, parent } from '../data/profile'

const nav = [
  { to: '/', label: 'Home', icon: LayoutDashboard, end: true },
  { to: '/journey', label: 'Journey Map', icon: Map },
  { to: '/transition', label: 'Transition Navigator', icon: Compass, badge: 'Focus' },
  { to: '/companion', label: 'AI Companion', icon: MessageCircleHeart },
  { to: '/documents', label: 'Document Vault', icon: FolderHeart },
  { to: '/resources', label: 'Resource Navigator', icon: LifeBuoy },
  { to: '/family', label: 'Family Circle', icon: Users },
]

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
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
      <nav className="flex-1 space-y-1 px-3">
        {nav.map((item) => {
          const Icon = item.icon
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
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
                  <Icon className={cx('h-5 w-5 shrink-0', isActive ? 'text-teal-600' : 'text-ink-faint group-hover:text-ink-soft')} />
                  <span className="flex-1">{item.label}</span>
                  {item.badge && (
                    <span className="rounded-full bg-lav-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-lav-600">
                      {item.badge}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          )
        })}
      </nav>

      {/* Reassurance card */}
      <div className="m-3 rounded-2xl bg-gradient-to-br from-teal-50 to-sage-50 p-4">
        <div className="flex items-center gap-2 text-teal-700">
          <Sparkles className="h-4 w-4" />
          <p className="text-sm font-semibold">You’re not alone</p>
        </div>
        <p className="mt-1.5 text-xs leading-relaxed text-ink-soft">
          You don’t have to figure out the whole road today. We’ll keep what matters in view, one step at a time.
        </p>
      </div>

      {/* Family chip */}
      <div className="flex items-center gap-3 border-t border-line px-6 py-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-100 text-sm font-semibold text-amber-600">
          {parent.name.split(' ').map((n) => n[0]).join('')}
        </div>
        <div className="leading-tight">
          <p className="text-sm font-semibold text-ink">{parent.name}</p>
          <p className="text-xs text-ink-faint">Caring for {child.name.split(' ')[0]}</p>
        </div>
      </div>
    </div>
  )
}

export default function Layout({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false)
  const location = useLocation()

  return (
    <div className="min-h-screen bg-canvas">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 hidden w-72 border-r border-line bg-surface lg:block">
        <SidebarContent />
      </aside>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-ink/20" onClick={() => setOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-72 bg-surface shadow-lift animate-fade-in">
            <button
              className="absolute right-3 top-3 rounded-lg p-2 text-ink-soft hover:bg-canvas"
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
        {/* Top bar with persistent child context */}
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
                {child.name.split(' ').map((n) => n[0]).join('')}
              </div>
              <div className="leading-tight">
                <p className="text-sm font-semibold text-ink">
                  {child.name} <span className="font-normal text-ink-faint">· age {child.age}</span>
                </p>
                <p className="text-xs text-ink-faint">
                  Current stage: <span className="font-medium text-lav-600">{child.currentStageLabel}</span>
                </p>
              </div>
            </div>

            <span className="hidden rounded-full bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-600 sm:inline-flex">
              XPRIZE Prototype
            </span>
          </div>
        </header>

        <main key={location.pathname} className="mx-auto max-w-6xl animate-fade-in px-4 py-7 sm:px-8 sm:py-9">
          {children}
        </main>
      </div>
    </div>
  )
}
