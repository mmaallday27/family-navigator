// Data export. The family owns their record, absolutely (Blueprint trust
// doctrine): one endpoint hands back the entire record plus every stored
// document, base64-encoded, as a single portable JSON file. Never held hostage.

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import type { Response } from 'express'
import type { AuthedRequest } from './auth'
import { db, now } from './db'
import { listUserDocuments } from './documents'

export function exportAll(req: AuthedRequest, res: Response) {
  const fam = db.prepare('SELECT record_json FROM families WHERE user_id = ?').get(req.userId) as
    | { record_json: string }
    | undefined
  const record = fam ? JSON.parse(fam.record_json) : null
  const documents = listUserDocuments(req.userId).map((d) => ({
    id: d.id,
    name: d.name,
    mime: d.mime,
    size: d.size,
    dataBase64: d.content.toString('base64'),
  }))

  const bundle = {
    exportedAt: now(),
    account: req.userEmail,
    record,
    documents,
    note: 'This is your complete Family Navigator record. It is yours to keep, move, or import elsewhere.',
  }

  res.setHeader('content-type', 'application/json')
  res.setHeader('content-disposition', 'attachment; filename="family-navigator-export.json"')
  res.send(JSON.stringify(bundle, null, 2))
}
