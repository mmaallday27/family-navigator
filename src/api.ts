// The browser's typed gateway to the real backend. Every call sends the
// session cookie (credentials: 'include') and surfaces a clean error message.
// Same-origin in dev via Vite's /api proxy; same-origin in prod (one server).

import type { FamilyState } from './store/FamilyContext'

async function req<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    credentials: 'include',
    headers: init?.body ? { 'content-type': 'application/json' } : undefined,
    ...init,
  })
  const text = await res.text()
  const data = text ? JSON.parse(text) : {}
  if (!res.ok) {
    const message = (data as { error?: string })?.error ?? `Request failed (${res.status})`
    throw new Error(message)
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

// --- Family record (cross-device persistence) ---
export const apiGetFamily = () =>
  req<{ record: FamilyState | null }>('/api/family').then((r) => r.record)

export const apiPutFamily = (record: FamilyState) =>
  req<{ ok: true }>('/api/family', { method: 'PUT', body: JSON.stringify({ record }) })

// --- Documents (real bytes) ---
export const apiUploadDocument = (name: string, mime: string, dataBase64: string) =>
  req<{ id: string; name: string; mime: string; size: number }>('/api/documents', {
    method: 'POST',
    body: JSON.stringify({ name, mime, dataBase64 }),
  })

export const apiDeleteDocument = (id: string) =>
  req<{ ok: true }>(`/api/documents/${id}`, { method: 'DELETE' })

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
