// Real authentication: bcrypt-hashed passwords, server-side sessions, and an
// HTTP-only cookie so the token is never readable by client JavaScript. Only
// a SHA-256 hash of the session token is stored, so a leaked database file
// yields no usable credentials.

import type { Request, Response, NextFunction, RequestHandler } from 'express'
import bcrypt from 'bcryptjs'
import { createHash, randomBytes } from 'node:crypto'
import { db, now, uuid } from './db'

const COOKIE = 'fn_session'
const SESSION_DAYS = 30
const MAX_PASSWORD = 128
const isProd = process.env.NODE_ENV === 'production'

export interface AuthedRequest extends Request {
  userId?: string
  userEmail?: string
}

const hashToken = (token: string) => createHash('sha256').update(token).digest('hex')

function createSession(userId: string): string {
  const token = randomBytes(32).toString('hex')
  const created = now()
  const expires = new Date(Date.now() + SESSION_DAYS * 86_400_000).toISOString()
  db.prepare('INSERT INTO sessions (token, user_id, created_at, expires_at) VALUES (?, ?, ?, ?)').run(
    hashToken(token),
    userId,
    created,
    expires,
  )
  return token
}

/** Remove expired sessions — called at boot and hourly (see index.ts). */
export function purgeExpiredSessions() {
  db.prepare('DELETE FROM sessions WHERE expires_at < ?').run(now())
}

function setCookie(req: Request, res: Response, token: string) {
  res.cookie(COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    // Secure whenever the request itself arrived over TLS (works behind a
    // trust-proxied TLS terminator) or we are explicitly in production.
    secure: req.secure || isProd,
    maxAge: SESSION_DAYS * 86_400_000,
    path: '/',
  })
}

const emailOk = (e: unknown): e is string =>
  typeof e === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.trim())

function passwordError(password: string): string | null {
  if (password.length < 8) return 'Password must be at least 8 characters.'
  if (password.length > MAX_PASSWORD) return `Password must be at most ${MAX_PASSWORD} characters.`
  return null
}

export async function signup(req: Request, res: Response) {
  const email = String(req.body?.email ?? '').trim().toLowerCase()
  const password = String(req.body?.password ?? '')
  if (!emailOk(email)) return res.status(400).json({ error: 'Enter a valid email.' })
  const pwErr = passwordError(password)
  if (pwErr) return res.status(400).json({ error: pwErr })

  const id = uuid()
  const hash = await bcrypt.hash(password, 10)
  try {
    db.prepare('INSERT INTO users (id, email, password_hash, created_at) VALUES (?, ?, ?, ?)').run(
      id,
      email,
      hash,
      now(),
    )
  } catch {
    // UNIQUE(email) — covers both the ordinary duplicate and the race.
    return res.status(409).json({ error: 'An account with that email already exists.' })
  }
  const token = createSession(id)
  setCookie(req, res, token)
  res.status(201).json({ email })
}

export async function login(req: Request, res: Response) {
  const email = String(req.body?.email ?? '').trim().toLowerCase()
  const password = String(req.body?.password ?? '').slice(0, MAX_PASSWORD + 1)
  if (password.length > MAX_PASSWORD) return res.status(400).json({ error: 'Email or password is incorrect.' })
  const row = db.prepare('SELECT id, password_hash FROM users WHERE email = ?').get(email) as
    | { id: string; password_hash: string }
    | undefined
  // Constant-ish: always run a compare to avoid trivial user-enumeration timing.
  const ok = row
    ? await bcrypt.compare(password, row.password_hash)
    : await bcrypt.compare(password, '$2a$10$invalidinvalidinvalidinvalidinvalidinvalidinv')
  if (!row || !ok) return res.status(401).json({ error: 'Email or password is incorrect.' })

  const token = createSession(row.id)
  setCookie(req, res, token)
  res.json({ email })
}

export function logout(req: AuthedRequest, res: Response) {
  const token = req.cookies?.[COOKIE]
  if (token) db.prepare('DELETE FROM sessions WHERE token = ?').run(hashToken(token))
  res.clearCookie(COOKIE, { path: '/' })
  res.json({ ok: true })
}

export function me(req: AuthedRequest, res: Response) {
  if (!req.userId) return res.status(401).json({ error: 'Not signed in.' })
  res.json({ email: req.userEmail })
}

/**
 * Permanent account deletion — the family owns their data, including the right
 * to erase it. Cascades remove sessions, the family record, and every document.
 */
export function deleteAccount(req: AuthedRequest, res: Response) {
  db.prepare('DELETE FROM users WHERE id = ?').run(req.userId)
  res.clearCookie(COOKIE, { path: '/' })
  res.json({ ok: true })
}

/** Attaches userId/userEmail when a valid, unexpired session cookie is present. */
export const attachUser: RequestHandler = (req: AuthedRequest, _res, next: NextFunction) => {
  const token = req.cookies?.[COOKIE]
  if (token) {
    const tokenHash = hashToken(token)
    const row = db
      .prepare(
        `SELECT s.user_id AS userId, s.expires_at AS expiresAt, u.email AS email
         FROM sessions s JOIN users u ON u.id = s.user_id WHERE s.token = ?`,
      )
      .get(tokenHash) as { userId: string; expiresAt: string; email: string } | undefined
    if (row) {
      if (new Date(row.expiresAt).getTime() < Date.now()) {
        db.prepare('DELETE FROM sessions WHERE token = ?').run(tokenHash)
      } else {
        req.userId = row.userId
        req.userEmail = row.email
      }
    }
  }
  next()
}

/** Gate for protected routes. */
export const requireAuth: RequestHandler = (req: AuthedRequest, res, next) => {
  if (!req.userId) return res.status(401).json({ error: 'Sign in required.' })
  next()
}
