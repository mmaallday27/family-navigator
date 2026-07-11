// The family record — the whole client-side FamilyState blob, persisted
// per user. This is what makes the platform cross-device: the record lives on
// the server, not in one browser's localStorage. Document *bytes* live in the
// documents table (documents.ts); this stores everything else verbatim.

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import type { Response } from 'express'
import type { AuthedRequest } from './auth'
import { db, now } from './db'

export function getFamily(req: AuthedRequest, res: Response) {
  const row = db.prepare('SELECT record_json FROM families WHERE user_id = ?').get(req.userId) as
    | { record_json: string }
    | undefined
  if (!row) return res.json({ record: null })
  try {
    res.json({ record: JSON.parse(row.record_json) })
  } catch {
    res.json({ record: null })
  }
}

export function putFamily(req: AuthedRequest, res: Response) {
  const record = req.body?.record
  if (!record || typeof record !== 'object') {
    return res.status(400).json({ error: 'Missing record.' })
  }
  const json = JSON.stringify(record)
  // Guardrail: the record blob should never be enormous (bytes go elsewhere).
  if (json.length > 2_000_000) return res.status(413).json({ error: 'Record too large.' })
  db.prepare(
    `INSERT INTO families (user_id, record_json, updated_at) VALUES (?, ?, ?)
     ON CONFLICT(user_id) DO UPDATE SET record_json = excluded.record_json, updated_at = excluded.updated_at`,
  ).run(req.userId, json, now())
  res.json({ ok: true })
}
