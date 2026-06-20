// Tiny classnames helper — joins truthy strings.
export function cx(...parts: (string | false | null | undefined)[]): string {
  return parts.filter(Boolean).join(' ')
}

// Maps an accent key to soft chip styles used across the app.
export const accentChip: Record<string, string> = {
  teal: 'bg-teal-50 text-teal-700',
  amber: 'bg-amber-50 text-amber-600',
  sage: 'bg-sage-50 text-sage-600',
  lav: 'bg-lav-50 text-lav-600',
  rose: 'bg-rose-50 text-rose-500',
}

export const accentSolid: Record<string, string> = {
  teal: 'bg-teal-500',
  amber: 'bg-amber-400',
  sage: 'bg-sage-500',
  lav: 'bg-lav-500',
  rose: 'bg-rose-500',
}

export const accentText: Record<string, string> = {
  teal: 'text-teal-600',
  amber: 'text-amber-500',
  sage: 'text-sage-600',
  lav: 'text-lav-600',
  rose: 'text-rose-500',
}
