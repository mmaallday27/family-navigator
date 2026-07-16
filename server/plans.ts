// Storage plans & entitlements. The Vault constitution (see docs/BLUEPRINT.md
// trust doctrine): a storage limit may stop NEW uploads; it must never lock a
// family out of viewing, exporting, or deleting what they already stored, and
// nothing is ever deleted automatically because a plan changes.
//
// Billing is deliberately NOT wired here — this is the entitlement layer a
// payment provider connects to later (see docs/OPERATIONS.md, billing note).
// No fake checkouts: tiers marked available:false render as "coming soon".

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import type { Response } from 'express'
import type { AuthedRequest } from './auth'
import { db } from './db'

export interface Plan {
  id: string
  name: string
  limitBytes: number
  /** Parent-facing one-liner. */
  blurb: string
  /** False until billing exists — the UI must render an honest disabled state. */
  available: boolean
}

const GB = 1024 * 1024 * 1024

export const PLANS: Record<string, Plan> = {
  free: {
    id: 'free',
    name: 'Family',
    limitBytes: 1 * GB,
    blurb: 'Every family starts here — room for years of records, free.',
    available: true,
  },
  keeper: {
    id: 'keeper',
    name: 'Lifetime Keeper',
    limitBytes: 10 * GB,
    blurb: 'For records that span decades — evaluations, IEPs, and history for the whole journey.',
    available: false, // pricing + billing not yet approved/wired
  },
}

export const MAX_FILE_BYTES = 10 * 1024 * 1024 // 10 MB per file

export function planForUser(userId: string): Plan {
  const row = db.prepare('SELECT plan FROM users WHERE id = ?').get(userId) as { plan?: string } | undefined
  return PLANS[row?.plan ?? 'free'] ?? PLANS.free
}

export function storageUsage(userId: string) {
  const plan = planForUser(userId)
  const row = db
    .prepare('SELECT COALESCE(SUM(size_bytes), 0) AS bytes, COUNT(*) AS count FROM documents WHERE user_id = ?')
    .get(userId) as { bytes: number; count: number }
  const bytesUsed = row.bytes
  return {
    plan: { id: plan.id, name: plan.name, limitBytes: plan.limitBytes, blurb: plan.blurb },
    bytesUsed,
    limitBytes: plan.limitBytes,
    remainingBytes: Math.max(0, plan.limitBytes - bytesUsed),
    percentUsed: Math.min(100, Math.round((bytesUsed / plan.limitBytes) * 1000) / 10),
    documentCount: row.count,
    maxFileBytes: MAX_FILE_BYTES,
    tiers: Object.values(PLANS),
  }
}

/** GET /api/storage — usage + plan + tier catalog for the storage UI. */
export function getStorage(req: AuthedRequest, res: Response) {
  res.json(storageUsage(req.userId))
}
