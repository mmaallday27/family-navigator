// The Family Navigator backend. One real server: authentication, the
// cross-device family record, real document storage, data export, and the AI
// navigator. In dev, Vite proxies /api here; in production, this also serves
// the built client from dist/ so a single process runs the whole product.

import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
import express from 'express'
import cookieParser from 'cookie-parser'
import { attachUser, login, logout, me, requireAuth, signup } from './auth'
import { getFamily, putFamily } from './family'
import { deleteDocument, downloadDocument, uploadDocument } from './documents'
import { exportAll } from './export'
import { initNavigator, navigatorHandler, navigatorStatus } from './navigator'

// Load .env (server-side secrets like ANTHROPIC_API_KEY) without a dependency.
try {
  ;(process as unknown as { loadEnvFile: (p: string) => void }).loadEnvFile('.env')
} catch {
  // No .env — fine; the navigator simply reports unconfigured.
}

const PORT = Number(process.env.PORT) || 8787
const app = express()

// Base64 document uploads and the record blob need a generous JSON limit.
app.use(express.json({ limit: '15mb' }))
app.use(cookieParser())
app.use(attachUser)

// --- Auth ---
app.post('/api/auth/signup', signup)
app.post('/api/auth/login', login)
app.post('/api/auth/logout', logout)
app.get('/api/auth/me', me)

// --- Family record (cross-device persistence) ---
app.get('/api/family', requireAuth, getFamily)
app.put('/api/family', requireAuth, putFamily)

// --- Documents (real bytes) ---
app.post('/api/documents', requireAuth, uploadDocument)
app.get('/api/documents/:id/content', requireAuth, downloadDocument)
app.delete('/api/documents/:id', requireAuth, deleteDocument)

// --- Data export (the family owns their data) ---
app.get('/api/export', requireAuth, exportAll)

// --- AI navigator ---
app.get('/api/navigator/status', navigatorStatus)
app.post('/api/navigator', navigatorHandler)

// --- Production: serve the built client ---
const dist = resolve(process.cwd(), 'dist')
if (existsSync(dist)) {
  app.use(express.static(dist))
  // SPA fallback for client-side routing (non-/api routes).
  app.get(/^(?!\/api\/).*/, (_req, res) => res.sendFile(resolve(dist, 'index.html')))
}

const configured = initNavigator()
app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`[family-navigator] API on http://localhost:${PORT}  ·  AI navigator: ${configured ? 'configured' : 'off (no key)'}`)
})
