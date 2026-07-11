// Real document storage — actual file bytes, per user. Uploads arrive as
// base64 JSON (no multipart dependency for a prototype's small files) and are
// stored as BLOBs. The vault's metadata still rides in the family record; this
// gives those documents real, downloadable content.

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import type { Response } from 'express'
import type { AuthedRequest } from './auth'
import { db, now, uuid } from './db'

const MAX_BYTES = 10 * 1024 * 1024 // 10 MB per file

/** Store bytes for a document; returns the id + size the client files in the record. */
export function uploadDocument(req: AuthedRequest, res: Response) {
  const name = String(req.body?.name ?? '').trim()
  const mime = String(req.body?.mime ?? 'application/octet-stream')
  const dataBase64 = String(req.body?.dataBase64 ?? '')
  if (!name) return res.status(400).json({ error: 'Missing document name.' })
  if (!dataBase64) return res.status(400).json({ error: 'Missing file data.' })

  let buf: Buffer
  try {
    buf = Buffer.from(dataBase64, 'base64')
  } catch {
    return res.status(400).json({ error: 'Invalid file data.' })
  }
  if (buf.length === 0) return res.status(400).json({ error: 'Empty file.' })
  if (buf.length > MAX_BYTES) return res.status(413).json({ error: 'File exceeds 10 MB.' })

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
  res.setHeader('content-type', row.mime)
  res.setHeader('content-disposition', `attachment; filename="${row.name.replace(/"/g, '')}"`)
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
