import { useEffect, useRef, type ReactNode } from 'react'
import { X } from 'lucide-react'
import { cx } from '../lib/cx'

export function PageHeader({
  eyebrow,
  title,
  subtitle,
  icon,
  action,
}: {
  eyebrow?: string
  title: string
  subtitle?: string
  icon?: ReactNode
  action?: ReactNode
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="flex items-start gap-4">
        {icon && (
          <div className="mt-1 flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-teal-50 text-teal-600">
            {icon}
          </div>
        )}
        <div>
          {eyebrow && (
            <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-teal-600">{eyebrow}</p>
          )}
          <h1 className="section-title text-2xl font-semibold leading-tight sm:text-3xl">{title}</h1>
          {subtitle && <p className="mt-2 max-w-2xl text-ink-soft">{subtitle}</p>}
        </div>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  )
}

export function Card({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cx('card p-5', className)}>{children}</div>
}

export function ProgressBar({
  value,
  accent = 'teal',
  label = 'Progress',
}: {
  value: number
  accent?: string
  /** Accessible name announced by screen readers. */
  label?: string
}) {
  const bar: Record<string, string> = {
    teal: 'bg-teal-500',
    amber: 'bg-amber-400',
    sage: 'bg-sage-500',
    lav: 'bg-lav-500',
  }
  const clamped = Math.max(0, Math.min(100, value))
  return (
    <div
      className="h-2 w-full overflow-hidden rounded-full bg-line"
      role="progressbar"
      aria-label={label}
      aria-valuenow={Math.round(clamped)}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className={cx('h-full rounded-full transition-all duration-500', bar[accent] ?? bar.teal)}
        style={{ width: `${clamped}%` }}
      />
    </div>
  )
}

export function ProgressRing({
  value,
  size = 64,
  stroke = 7,
  accent = '#2F8F83',
  label,
}: {
  value: number
  size?: number
  stroke?: number
  accent?: string
  label?: ReactNode
}) {
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const offset = c - (Math.max(0, Math.min(100, value)) / 100) * c
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#EBE6DD" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={accent}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          className="transition-all duration-700"
        />
      </svg>
      <span className="absolute text-sm font-semibold text-ink">{label ?? `${value}%`}</span>
    </div>
  )
}

export function Chip({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return <span className={cx('chip', className)}>{children}</span>
}

export function Disclaimer({ children }: { children: ReactNode }) {
  return (
    <p className="rounded-xl bg-canvas px-4 py-3 text-xs leading-relaxed text-ink-faint">{children}</p>
  )
}

export function EmptyState({
  icon,
  title,
  body,
  action,
}: {
  icon: ReactNode
  title: string
  body?: string
  action?: ReactNode
}) {
  return (
    <div className="flex flex-col items-center p-8 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-canvas text-ink-faint">
        {icon}
      </div>
      <p className="mt-3 font-semibold text-ink">{title}</p>
      {body && <p className="mt-1 max-w-sm text-sm text-ink-soft">{body}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

/**
 * Accessible modal: labelled dialog, Escape to close, focus moves into the
 * panel on open, stays trapped inside it, and returns to the trigger on close.
 */
export function Modal({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
}) {
  const panelRef = useRef<HTMLDivElement>(null)
  // Keep the latest onClose in a ref so inline handlers don't re-run the
  // effects below on every render (which would steal focus mid-keystroke).
  const onCloseRef = useRef(onClose)
  onCloseRef.current = onClose

  // Focus capture on open, restore to the trigger on close.
  useEffect(() => {
    if (!open) return
    const previouslyFocused = document.activeElement as HTMLElement | null
    panelRef.current?.focus()
    return () => previouslyFocused?.focus()
  }, [open])

  // Escape closes; Tab / Shift+Tab wrap within the panel's focusable elements.
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCloseRef.current()
        return
      }
      if (e.key !== 'Tab') return
      const panel = panelRef.current
      if (!panel) return
      const focusables = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE))
      if (focusables.length === 0) {
        e.preventDefault()
        panel.focus()
        return
      }
      const first = focusables[0]
      const last = focusables[focusables.length - 1]
      const active = document.activeElement
      if (e.shiftKey) {
        if (active === first || active === panel || !panel.contains(active)) {
          e.preventDefault()
          last.focus()
        }
      } else if (active === last || !panel.contains(active)) {
        e.preventDefault()
        first.focus()
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label={title}>
      <div className="absolute inset-0 bg-ink/30" onClick={onClose} aria-hidden />
      <div
        ref={panelRef}
        tabIndex={-1}
        className="relative w-full max-w-lg animate-fade-in rounded-3xl bg-surface p-6 shadow-lift outline-none"
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-2 text-ink-faint hover:bg-canvas hover:text-ink-soft"
          aria-label="Close dialog"
        >
          <X className="h-4 w-4" />
        </button>
        <h3 className="section-title pr-8 text-lg font-semibold">{title}</h3>
        {children}
      </div>
    </div>
  )
}
