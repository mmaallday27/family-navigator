// Real authentication: bcrypt-hashed passwords, server-side sessions, and an
// HTTP-only cookie so the token is never readable by client JavaScript.

import type { Request, Response, NextFunction, RequestHandler } from 'express'
import bcrypt from 'bcryptjs'
import { randomBytes } from 'node:crypto'
import { db, now, uuid } from './db'

const COOKIE = 'fn_session'
const SESSION_DAYS = 30
const isProd = process.env.NODE_ENV === 'production'

export interface AuthedRequest extends Request {
  userId?: string
  userEmail?: string
}

function createSession(userId: string): string {
  const token = randomBytes(32).toString('hex')
  const created = now()
  const expires = new Date(Date.now() + SESSION_DAYS * 86_400_000).toISOString()
  db.prepare('INSERT INTO sessions (token, user_id, created_at, expires_at) VALUES (?, ?, ?, ?)').run(
    token,
    userId,
    created,
    expires,
  )
  return token
}

function setCookie(res: Response, token: string) {
  res.cookie(COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: isProd,
    maxAge: SESSION_DAYS * 86_400_000,
    path: '/',
  })
}

const emailOk = (e: unknown): e is string =>
  typeof e === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.trim())

export function signup(req: Request, res: Response) {
  const email = String(req.body?.email ?? '').trim().toLowerCase()
  const password = String(req.body?.password ?? '')
  if (!emailOk(email)) return res.status(400).json({ error: 'Enter a valid email.' })
  if (password.length < 8) return res.status(400).json({ error: 'Password must be at least 8 characters.' })

  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email)
  if (existing) return res.status(409).json({ error: 'An account with that email already exists.' })

  const id = uuid()
  const hash = bcrypt.hashSync(password, 10)
  db.prepare('INSERT INTO users (id, email, password_hash, created_at) VALUES (?, ?, ?, ?)').run(
    id,
    email,
    hash,
    now(),
  )
  const token = createSession(id)
  setCookie(res, token)
  res.status(201).json({ email })
}

export function login(req: Request, res: Response) {
  const email = String(req.body?.email ?? '').trim().toLowerCase()
  const password = String(req.body?.password ?? '')
  const row = db.prepare('SELECT id, password_hash FROM users WHERE email = ?').get(email) as
    | { id: string; password_hash: string }
    | undefined
  // Constant-ish: always run a compare to avoid trivial user-enumeration timing.
  const ok = row ? bcrypt.compareSync(password, row.password_hash) : bcrypt.compareSync(password, '$2a$10$invalidinvalidinvalidinvalidinvalidinvalidinv')
  if (!row || !ok) return res.status(401).json({ error: 'Email or password is incorrect.' })

  const token = createSession(row.id)
  setCookie(res, token)
  res.json({ email })
}

export function logout(req: AuthedRequest, res: Response) {
  const token = req.cookies?.[COOKIE]
  if (token) db.prepare('DELETE FROM sessions WHERE token = ?').run(token)
  res.clearCookie(COOKIE, { path: '/' })
  res.json({ ok: true })
}

export function me(req: AuthedRequest, res: Response) {
  if (!req.userId) return res.status(401).json({ error: 'Not signed in.' })
  res.json({ email: req.userEmail })
}

/** Attaches userId/userEmail when a valid, unexpired session cookie is present. */
export const attachUser: RequestHandler = (req: AuthedRequest, _res, next: NextFunction) => {
  const token = req.cookies?.[COOKIE]
  if (token) {
    const row = db
      .prepare(
        `SELECT s.user_id AS userId, s.expires_at AS expiresAt, u.email AS email
         FROM sessions s JOIN users u ON u.id = s.user_id WHERE s.token = ?`,
      )
      .get(token) as { userId: string; expiresAt: string; email: string } | undefined
    if (row) {
      if (new Date(row.expiresAt).getTime() < Date.now()) {
        db.prepare('DELETE FROM sessions WHERE token = ?').run(token)
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
