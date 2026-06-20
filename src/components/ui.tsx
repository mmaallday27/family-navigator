import type { ReactNode } from 'react'
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

export function ProgressBar({ value, accent = 'teal' }: { value: number; accent?: string }) {
  const bar: Record<string, string> = {
    teal: 'bg-teal-500',
    amber: 'bg-amber-400',
    sage: 'bg-sage-500',
    lav: 'bg-lav-500',
  }
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-line">
      <div
        className={cx('h-full rounded-full transition-all duration-500', bar[accent] ?? bar.teal)}
        style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
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
