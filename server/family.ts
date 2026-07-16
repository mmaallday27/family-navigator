// The family record — the whole client-side FamilyState blob, persisted
// per user. This is what makes the platform cross-device: the record lives on
// the server, not in one browser's localStorage. Document *bytes* live in the
// documents table (documents.ts); this stores everything else verbatim.
//
// Writes use optimistic concurrency: the client sends the `updatedAt` it
// hydrated with, and a mismatch returns 409 with the current server copy —
// so two devices can never silently overwrite each other's changes.

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import type { Response } from 'express'
import type { AuthedRequest } from './auth'
import { db, now } from './db'

const MAX_RECORD_BYTES = 2_000_000

/**
 * Minimal shape check so a buggy or malicious client can't replace a family's
 * record with garbage. Deliberately loose about extras; strict about the
 * fields every screen depends on.
 */
function recordError(record: unknown): string | null {
  if (!record || typeof record !== 'object' || Array.isArray(record)) return 'Record must be an object.'
  const r = record
  if (typeof r.version !== 'number') return 'Record is missing a version.'
  if (typeof r.onboarded !== 'boolean') return 'Record is missing onboarded.'
  if (!r.child || typeof r.child !== 'object' || typeof r.child.name !== 'string') return 'Record is missing the child profile.'
  if (!r.parent || typeof r.parent !== 'object') return 'Record is missing the parent profile.'
  for (const key of ['concerns', 'savedResources', 'documents', 'goals', 'activity']) {
    if (!Array.isArray(r[key])) return `Record field "${key}" must be an array.`
  }
  if (!r.checks || typeof r.checks !== 'object') return 'Record field "checks" must be an object.'
  if (!r.aiMemory || typeof r.aiMemory !== 'object') return 'Record field "aiMemory" must be an object.'
  return null
}

export function getFamily(req: AuthedRequest, res: Response) {
  const row = db
    .prepare('SELECT record_json, updated_at FROM families WHERE user_id = ?')
    .get(req.userId) as { record_json: string; updated_at: string } | undefined
  if (!row) return res.json({ record: null, updatedAt: null })
  try {
    res.json({ record: JSON.parse(row.record_json), updatedAt: row.updated_at })
  } catch {
    // A corrupt stored record must NOT present as "no record" — the client
    // would treat that as a fresh account and overwrite the real data.
    res.status(500).json({ error: 'record_corrupt' })
  }
}

export function putFamily(req: AuthedRequest, res: Response) {
  const record = req.body?.record
  const err = recordError(record)
  if (err) return res.status(400).json({ error: err })
  const json = JSON.stringify(record)
  // Guardrail: the record blob should never be enormous (bytes go elsewhere).
  if (Buffer.byteLength(json) > MAX_RECORD_BYTES) return res.status(413).json({ error: 'Record too large.' })

  const existing = db
    .prepare('SELECT record_json, updated_at FROM families WHERE user_id = ?')
    .get(req.userId) as { record_json: string; updated_at: string } | undefined
  const base = req.body?.baseUpdatedAt ?? null
  if (existing && base !== existing.updated_at) {
    // Another device saved since this client last loaded. Hand back the
    // current copy so the client can re-hydrate instead of clobbering it.
    let current = null
    try {
      current = JSON.parse(existing.record_json)
    } catch {
      current = null
    }
    return res.status(409).json({ error: 'conflict', record: current, updatedAt: existing.updated_at })
  }

  const updatedAt = now()
  db.prepare(
    `INSERT INTO families (user_id, record_json, updated_at) VALUES (?, ?, ?)
     ON CONFLICT(user_id) DO UPDATE SET record_json = excluded.record_json, updated_at = excluded.updated_at`,
  ).run(req.userId, json, updatedAt)
  res.json({ ok: true, updatedAt })
}

/**
 * Start over: removes the record AND the stored document bytes, so a reset
 * never leaves orphaned files that would still appear in a data export.
 */
export function resetFamily(req: AuthedRequest, res: Response) {
  db.prepare('DELETE FROM documents WHERE user_id = ?').run(req.userId)
  db.prepare('DELETE FROM families WHERE user_id = ?').run(req.userId)
  res.json({ ok: true })
}
