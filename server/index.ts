// The Family Navigator backend. One real server: authentication, the
// cross-device family record, real document storage, data export, and the AI
// navigator. In dev, Vite proxies /api here; in production, this also serves
// the built client from dist/ so a single process runs the whole product.

import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
import express from 'express'
import type { NextFunction, Request, Response } from 'express'
import cookieParser from 'cookie-parser'
import { attachUser, deleteAccount, login, logout, me, purgeExpiredSessions, requireAuth, signup } from './auth'
import type { AuthedRequest } from './auth'
import { getFamily, putFamily, resetFamily } from './family'
import { deleteDocument, downloadDocument, uploadDocument } from './documents'
import { exportAll } from './export'
import { initNavigator, navigatorHandler, navigatorStatus } from './navigator'
import { analyzeDocument, getAnalysis, initAnalyzer } from './analyze'
import { getStorage } from './plans'
import { rateLimit } from './ratelimit'
import { db } from './db'

// .env is loaded in db.ts (the earliest-evaluated module — ESM imports run
// before this file's body, and DATA_DIR is needed at import time).

const PORT = Number(process.env.PORT) || 8787
const app = express()

// Behind a TLS-terminating proxy (any real deployment), trust the first hop so
// req.secure and req.ip reflect the actual client connection.
app.set('trust proxy', 1)
app.disable('x-powered-by')

// Security headers. The app is fully self-contained (no CDN assets), so the
// CSP can be strict. Tailwind injects styles at build time; Vite dev styles
// need 'unsafe-inline' for style tags only.
app.use((_req, res, next) => {
  res.setHeader('x-content-type-options', 'nosniff')
  res.setHeader('x-frame-options', 'DENY')
  res.setHeader('referrer-policy', 'no-referrer')
  // Google Fonts is the one external asset (see index.html); self-hosting the
  // two font families would let this collapse back to 'self' only.
  res.setHeader(
    'content-security-policy',
    "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data:; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'",
  )
  next()
})

// Cross-origin write protection (defense in depth on top of SameSite=Lax):
// browsers send an Origin header on cross-site requests — reject any mutating
// request whose Origin is present and not one we trust.
//
// A single-process deploy is same-origin (Origin.host === req.headers.host), but
// that comparison breaks the moment a proxy sits in front: the Vite dev server
// proxies /api here with changeOrigin, rewriting Host to the backend while the
// browser's Origin stays as the dev server (localhost, or a LAN IP when testing
// on a phone); a production reverse proxy likewise presents a public Origin over
// an internal Host. So we accept: (1) the request's own Host, (2) any origin
// listed in TRUSTED_ORIGINS, and (3) in development only, loopback / private-LAN
// origins so mobile testing works without configuration.
const isProd = process.env.NODE_ENV === 'production'
const trustedOrigins = new Set(
  (process.env.TRUSTED_ORIGINS ?? '')
    .split(',')
    .map((o) => o.trim().replace(/\/$/, ''))
    .filter(Boolean),
)

// Loopback or RFC 1918 private-network host — the addresses a dev machine and
// phones on the same Wi-Fi actually use. Never trusted in production.
function isLocalHostname(hostname: string): boolean {
  if (hostname === 'localhost' || hostname === '::1') return true
  if (/^127\./.test(hostname)) return true
  if (/^10\./.test(hostname)) return true
  if (/^192\.168\./.test(hostname)) return true
  if (/^172\.(1[6-9]|2\d|3[01])\./.test(hostname)) return true
  return false
}

function originIsTrusted(origin: string, host: string | undefined): boolean {
  let url: URL
  try {
    url = new URL(origin)
  } catch {
    return false // malformed Origin
  }
  if (host && url.host === host) return true
  if (trustedOrigins.has(url.origin)) return true
  if (!isProd && isLocalHostname(url.hostname)) return true
  return false
}

app.use((req, res, next) => {
  if (req.method === 'GET' || req.method === 'HEAD' || req.method === 'OPTIONS') return next()
  const origin = req.headers.origin
  if (!origin) return next() // same-origin fetch/curl — no Origin header
  if (originIsTrusted(origin, req.headers.host)) return next()
  res.status(403).json({ error: 'Cross-origin request rejected.' })
})

// A tight default body limit; only the routes that genuinely carry large
// payloads (document upload, the record blob) get more — those routes skip
// the default parser and use their own.
const defaultBody = express.json({ limit: '100kb' })
const documentBody = express.json({ limit: '15mb' })
const recordBody = express.json({ limit: '3mb' })
app.use((req, res, next) => {
  const largeBody =
    (req.method === 'POST' && req.path === '/api/documents') || (req.method === 'PUT' && req.path === '/api/family')
  if (largeBody) return next()
  defaultBody(req, res, next)
})
app.use(cookieParser())
app.use(attachUser)

// --- Health (for uptime monitors / load balancers) ---
app.get('/healthz', (_req, res) => {
  try {
    db.prepare('SELECT 1').get()
    res.json({ ok: true })
  } catch {
    res.status(500).json({ ok: false })
  }
})

// --- Rate limits (in-memory; per-process) ---
const ip = (req: Request) => req.ip ?? 'unknown'
const loginLimit = rateLimit({
  windowMs: 15 * 60_000,
  max: 10,
  key: (req) => `${ip(req)}:${String(req.body?.email ?? '')}`,
  message: 'Too many sign-in attempts — please wait 15 minutes and try again.',
})
const signupLimit = rateLimit({
  windowMs: 60 * 60_000,
  max: 5,
  key: ip,
  message: 'Too many accounts created from this connection — please try again later.',
})
const navigatorLimit = rateLimit({
  windowMs: 60 * 60_000,
  max: 30,
  key: (req) => (req as AuthedRequest).userId ?? null,
  message: 'The navigator needs a short breather — please try again in a few minutes.',
})
const analyzeLimit = rateLimit({
  windowMs: 60 * 60_000,
  max: 15,
  key: (req) => (req as AuthedRequest).userId ?? null,
  message: 'Document analysis needs a short breather — please try again in a few minutes.',
})

// --- Auth ---
app.post('/api/auth/signup', signupLimit, signup)
app.post('/api/auth/login', loginLimit, login)
app.post('/api/auth/logout', logout)
app.get('/api/auth/me', me)
app.delete('/api/account', requireAuth, deleteAccount)

// --- Family record (cross-device persistence) ---
app.get('/api/family', requireAuth, getFamily)
app.put('/api/family', requireAuth, recordBody, putFamily)
app.post('/api/family/reset', requireAuth, resetFamily)

// --- Documents (real bytes) + document intelligence ---
app.post('/api/documents', requireAuth, documentBody, uploadDocument)
app.get('/api/documents/:id/content', requireAuth, downloadDocument)
app.delete('/api/documents/:id', requireAuth, deleteDocument)
app.post('/api/documents/:id/analyze', requireAuth, analyzeLimit, analyzeDocument)
app.get('/api/documents/:id/analysis', requireAuth, getAnalysis)

// --- Storage usage & plan entitlements ---
app.get('/api/storage', requireAuth, getStorage)

// --- Data export (the family owns their data) ---
app.get('/api/export', requireAuth, exportAll)

// --- AI navigator (authenticated: this endpoint spends real API budget) ---
app.get('/api/navigator/status', requireAuth, navigatorStatus)
app.post('/api/navigator', requireAuth, navigatorLimit, navigatorHandler)

// Unknown /api routes get JSON, never an HTML error page.
app.use('/api', (_req, res) => res.status(404).json({ error: 'Not found.' }))

// --- Production: serve the built client ---
const dist = resolve(import.meta.dirname, '../dist')
if (existsSync(dist)) {
  app.use(express.static(dist))
  // SPA fallback for client-side routing (non-/api routes).
  app.get(/^(?!\/api\/).*/, (_req, res) => res.sendFile(resolve(dist, 'index.html')))
}

// JSON error handler — the client always gets {error}, never an HTML page.
// (Body-parser 413s, malformed JSON, and any handler throw all land here.)
app.use((err: Error & { status?: number; type?: string }, req: Request, res: Response, _next: NextFunction) => {
  const status = err.status && err.status >= 400 && err.status < 600 ? err.status : 500
  const message =
    status === 413
      ? 'That upload is too large.'
      : status === 400
        ? 'We couldn’t read that request.'
        : 'Something went wrong on our side.'
  // eslint-disable-next-line no-console
  console.error(`[error] ${req.method} ${req.path} -> ${status}:`, err.message)
  if (!res.headersSent) res.status(status).json({ error: message })
})

const configured = initNavigator()
initAnalyzer()
purgeExpiredSessions()
setInterval(purgeExpiredSessions, 60 * 60_000).unref()

if (existsSync(dist) && process.env.NODE_ENV !== 'production') {
  // eslint-disable-next-line no-console
  console.warn(
    '[family-navigator] WARNING: serving a production build without NODE_ENV=production — set it in your deploy config.',
  )
}

const server = app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`[family-navigator] API on http://localhost:${PORT}  ·  AI navigator: ${configured ? 'configured' : 'off (no key)'}`)
})

// Graceful shutdown: finish in-flight responses, then close the database.
for (const signal of ['SIGINT', 'SIGTERM'] as const) {
  process.on(signal, () => {
    server.close(() => {
      try {
        db.close()
      } catch {
        // Already closed.
      }
      process.exit(0)
    })
    // Don't hang forever on stubborn keep-alive connections.
    setTimeout(() => process.exit(0), 5_000).unref()
  })
}
