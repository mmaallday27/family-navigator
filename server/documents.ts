// Real document storage — actual file bytes, per user. Uploads arrive as
// base64 JSON (no multipart dependency for a prototype's small files) and are
// stored as BLOBs. The vault's metadata still rides in the family record; this
// gives those documents real, downloadable content.

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import type { Response } from 'express'
import type { AuthedRequest } from './auth'
import { db, now, uuid } from './db'
import { MAX_FILE_BYTES, planForUser } from './plans'

const MAX_NAME = 200

// Only well-formed types we expect from a family's documents; anything else is
// stored and served as a generic binary so a stored blob can never be coaxed
// into rendering as HTML on our origin.
const MIME_ALLOWED = /^(application\/pdf|image\/(png|jpeg|gif|webp|heic|heif)|text\/plain|application\/(msword|vnd\.openxmlformats-officedocument\.(wordprocessingml\.document|spreadsheetml\.sheet|presentationml\.presentation)|vnd\.ms-excel|vnd\.ms-powerpoint))$/

const BASE64 = /^[A-Za-z0-9+/]+={0,2}$/

/** Store bytes for a document; returns the id + size the client files in the record. */
export function uploadDocument(req: AuthedRequest, res: Response) {
  const name = String(req.body?.name ?? '').trim().slice(0, MAX_NAME)
  const rawMime = String(req.body?.mime ?? '')
  const mime = MIME_ALLOWED.test(rawMime) ? rawMime : 'application/octet-stream'
  const dataBase64 = String(req.body?.dataBase64 ?? '')
  if (!name) return res.status(400).json({ error: 'Missing document name.' })
  if (!dataBase64) return res.status(400).json({ error: 'Missing file data.' })
  if (!BASE64.test(dataBase64)) return res.status(400).json({ error: 'Invalid file data.' })

  const buf = Buffer.from(dataBase64, 'base64')
  if (buf.length === 0) return res.status(400).json({ error: 'Empty file.' })
  if (buf.length > MAX_FILE_BYTES) return res.status(413).json({ error: 'File exceeds 10 MB.' })

  // Entitlement check: a full plan stops NEW uploads only — viewing, export,
  // and deletion of existing records are never gated (Vault constitution).
  const plan = planForUser(req.userId)
  const used = db
    .prepare('SELECT COALESCE(SUM(size_bytes), 0) AS total FROM documents WHERE user_id = ?')
    .get(req.userId) as { total: number }
  if (used.total + buf.length > plan.limitBytes) {
    return res.status(413).json({
      error: 'storage_full',
      message:
        'Your family’s storage is full. Everything you’ve saved stays safe and exportable — to add more, free up space or expand your storage.',
      bytesUsed: used.total,
      limitBytes: plan.limitBytes,
    })
  }

  const id = uuid()
  db.prepare(
    'INSERT INTO documents (id, user_id, name, mime, size_bytes, content, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
  ).run(id, req.userId, name, mime, buf.length, buf, now())

  res.status(201).json({ id, name, mime, size: buf.length })
}

export function downloadDocument(req: AuthedRequest, res: Response) {
  const row = db
    .prepare('SELECT name, mime, content FROM documents WHERE id = ? AND user_id = ?')
    .get(req.params.id, req.userId) as { name: string; mime: string; content: Buffer } | undefined
  if (!row) return res.status(404).json({ error: 'Document not found.' })
  // ASCII-safe fallback plus RFC 5987 encoding for the real (possibly Unicode)
  // name — control characters and quotes can never reach the header raw.
  const safeAscii = row.name.replace(/[^\w .,()\-]/g, '_').slice(0, MAX_NAME) || 'download'
  const encoded = encodeURIComponent(row.name.replace(/[\r\n]/g, ' ')).slice(0, 600)
  res.setHeader('content-type', MIME_ALLOWED.test(row.mime) ? row.mime : 'application/octet-stream')
  res.setHeader('x-content-type-options', 'nosniff')
  res.setHeader('content-disposition', `attachment; filename="${safeAscii}"; filename*=UTF-8''${encoded}`)
  res.send(row.content)
}

export function deleteDocument(req: AuthedRequest, res: Response) {
  db.prepare('DELETE FROM documents WHERE id = ? AND user_id = ?').run(req.params.id, req.userId)
  res.json({ ok: true })
}

/** All stored document bytes for the user — used by the export bundle. */
export function listUserDocuments(userId: string) {
  return db
    .prepare('SELECT id, name, mime, size_bytes AS size, content FROM documents WHERE user_id = ?')
    .all(userId) as { id: string; name: string; mime: string; size: number; content: Buffer }[]
}
