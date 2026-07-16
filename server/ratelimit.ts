// Minimal in-memory rate limiting — no dependency, good for a single-process
// MVP. Fixed window per key. If we ever run more than one process, swap the
// Map for a shared store; the middleware contract stays the same.

import type { RequestHandler, Request } from 'express'

interface Bucket {
  count: number
  resetAt: number
}

export function rateLimit(opts: {
  windowMs: number
  max: number
  /** Derives the bucket key (IP, user id, IP+email…). Return null to skip. */
  key: (req: Request) => string | null
  message?: string
}): RequestHandler {
  const buckets = new Map<string, Bucket>()

  // Keep the map from growing unbounded.
  setInterval(() => {
    const now = Date.now()
    for (const [k, b] of buckets) if (b.resetAt <= now) buckets.delete(k)
  }, Math.max(opts.windowMs, 60_000)).unref()

  return (req, res, next) => {
    const k = opts.key(req)
    if (k === null) return next()
    const now = Date.now()
    let b = buckets.get(k)
    if (!b || b.resetAt <= now) {
      b = { count: 0, resetAt: now + opts.windowMs }
      buckets.set(k, b)
    }
    b.count += 1
    if (b.count > opts.max) {
      res.setHeader('retry-after', Math.ceil((b.resetAt - now) / 1000))
      return res.status(429).json({ error: opts.message ?? 'Too many requests — please wait a moment and try again.' })
    }
    next()
  }
}
