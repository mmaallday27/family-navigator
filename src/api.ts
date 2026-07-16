// The browser's typed gateway to the real backend. Every call sends the
// session cookie (credentials: 'include') and surfaces a clean error message.
// Same-origin in dev via Vite's /api proxy; same-origin in prod (one server).

import type { FamilyState } from './store/FamilyContext'
import type { DocumentInsights } from './data/documents'

export interface StorageInfo {
  plan: { id: string; name: string; limitBytes: number; blurb: string }
  bytesUsed: number
  limitBytes: number
  remainingBytes: number
  percentUsed: number
  documentCount: number
  maxFileBytes: number
  tiers: { id: string; name: string; limitBytes: number; blurb: string; available: boolean }[]
}

/** The full server-side analysis (superset of the DocumentInsights digest). */
export interface DocumentAnalysis extends Omit<DocumentInsights, 'status'> {
  confidence?: 'high' | 'medium' | 'low'
}

/** Thrown when a family-record write loses an optimistic-concurrency race. */
export class ConflictError extends Error {
  record: FamilyState | null
  updatedAt: string
  constructor(record: FamilyState | null, updatedAt: string) {
    super('Record was updated from another device.')
    this.name = 'ConflictError'
    this.record = record
    this.updatedAt = updatedAt
  }
}

async function req<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    credentials: 'include',
    headers: init?.body ? { 'content-type': 'application/json' } : undefined,
    ...init,
  })
  const text = await res.text()
  // Error responses may be non-JSON (proxy 502 pages, body-parser HTML) —
  // never let a parse failure mask the real status.
  let data: unknown = {}
  try {
    data = text ? JSON.parse(text) : {}
  } catch {
    data = {}
  }
  if (!res.ok) {
    if (res.status === 409 && (data as { error?: string })?.error === 'conflict') {
      const d = data as { record: FamilyState | null; updatedAt: string }
      throw new ConflictError(d.record, d.updatedAt)
    }
    const fallback =
      res.status === 413
        ? 'That’s too large to upload.'
        : res.status === 429
          ? 'Too many requests — please wait a moment.'
          : `We couldn’t reach the server (${res.status}). Please try again.`
    // Servers send {error: <slug>, message: <friendly text>} for coded errors;
    // prefer the friendly text so a parent never sees a slug.
    const d = data as { error?: string; message?: string }
    throw new Error(d?.message ?? d?.error ?? fallback)
  }
  return data as T
}

// --- Auth ---
export const apiSignup = (email: string, password: string) =>
  req<{ email: string }>('/api/auth/signup', { method: 'POST', body: JSON.stringify({ email, password }) })

export const apiLogin = (email: string, password: string) =>
  req<{ email: string }>('/api/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) })

export const apiLogout = () => req<{ ok: true }>('/api/auth/logout', { method: 'POST' })

export const apiMe = () => req<{ email: string }>('/api/auth/me')

/** Permanently deletes the account, the record, and every stored document. */
export const apiDeleteAccount = () => req<{ ok: true }>('/api/account', { method: 'DELETE' })

// --- Family record (cross-device persistence) ---
export const apiGetFamily = () =>
  req<{ record: FamilyState | null; updatedAt: string | null }>('/api/family')

export const apiPutFamily = (record: FamilyState, baseUpdatedAt: string | null, keepalive = false) =>
  req<{ ok: true; updatedAt: string }>('/api/family', {
    method: 'PUT',
    body: JSON.stringify({ record, baseUpdatedAt }),
    keepalive,
  })

/** Clears the record AND stored document bytes — a true start-over. */
export const apiResetFamily = () => req<{ ok: true }>('/api/family/reset', { method: 'POST' })

// --- Documents (real bytes) ---
export const apiUploadDocument = (name: string, mime: string, dataBase64: string) =>
  req<{ id: string; name: string; mime: string; size: number }>('/api/documents', {
    method: 'POST',
    body: JSON.stringify({ name, mime, dataBase64 }),
  })

export const apiDeleteDocument = (id: string) =>
  req<{ ok: true }>(`/api/documents/${id}`, { method: 'DELETE' })

/** Run grounded analysis on a stored document's real bytes. Slow (~10-60s). */
export const apiAnalyzeDocument = (id: string) =>
  req<{ status: 'ok'; analysis: DocumentAnalysis }>(`/api/documents/${id}/analyze`, { method: 'POST' })

export const apiGetAnalysis = (id: string) =>
  req<{ status: 'ok' | 'failed' | 'unsupported' | 'none'; analysis: DocumentAnalysis | null }>(
    `/api/documents/${id}/analysis`,
  )

// --- Storage usage & plans ---
export const apiStorage = () => req<StorageInfo>('/api/storage')

/** A document's downloadable URL (same-origin GET carries the session cookie). */
export const documentContentUrl = (id: string) => `/api/documents/${id}/content`

/** The full data-export URL — the family owns their record. */
export const exportUrl = '/api/export'

/** Read a File into a base64 string (no data: prefix). */
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = String(reader.result)
      resolve(result.slice(result.indexOf(',') + 1))
    }
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(file)
  })
}
