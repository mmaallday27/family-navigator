// Persistence layer. Uses Node's built-in SQLite (node:sqlite) — zero native
// dependencies, so it runs anywhere Node 22+ does with no build step. The
// schema is deliberately standard SQL: porting to Postgres for a cloud
// deployment is a driver swap, not a rewrite. The family owns their data
// (Blueprint trust doctrine): everything here is exportable and deletable.
//
// ARCHITECTURE DECISION (2026-07-15, pilot): SQLite on a persistent volume
// with scripted backups is the deliberate choice for the controlled pilot —
// one process, one file to protect, zero native deps, WAL durability. The
// documented trigger to move to Postgres + object storage is ANY of:
// horizontal scaling (a second app process), >~2,000 active families, or
// >~50 GB of stored documents. See docs/OPERATIONS.md.

// node:sqlite is experimental in Node; it has no @types yet, so we run the
// server via tsx (transpile-only) and keep types loose in this module.
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import { DatabaseSync } from 'node:sqlite'
import { mkdirSync, readdirSync, unlinkSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { randomUUID } from 'node:crypto'

// Load .env HERE, not in index.ts — ESM imports evaluate before the importing
// module's body, and this module needs DATA_DIR at evaluation time.
try {
  ;(process as unknown as { loadEnvFile: (p: string) => void }).loadEnvFile(resolve(import.meta.dirname, '../.env'))
} catch {
  // No .env — fine; real environment variables still apply.
}

// DATA_DIR lets a deployment point the database at a persistent volume; the
// default resolves relative to this file (not cwd) so starting the server from
// any directory always finds the same database.
export const DATA_DIR = process.env.DATA_DIR || resolve(import.meta.dirname, 'data')
const DB_PATH = resolve(DATA_DIR, 'app.db')
mkdirSync(dirname(DB_PATH), { recursive: true })

export const db = new DatabaseSync(DB_PATH)

db.exec(`
  PRAGMA journal_mode = WAL;
  PRAGMA foreign_keys = ON;
`)

// ---------------------------------------------------------------------------
// Migrations. Versioned via PRAGMA user_version; each entry runs exactly once,
// in order, inside a transaction. NEVER edit a shipped migration — append a
// new one. Existing databases (created before the runner) are at version 0;
// migration 1 is the idempotent baseline they already match.
// ---------------------------------------------------------------------------
const MIGRATIONS: { version: number; name: string; sql: string }[] = [
  {
    version: 1,
    name: 'baseline',
    sql: `
      CREATE TABLE IF NOT EXISTS users (
        id            TEXT PRIMARY KEY,
        email         TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        created_at    TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS sessions (
        token      TEXT PRIMARY KEY,
        user_id    TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        created_at TEXT NOT NULL,
        expires_at TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS families (
        user_id     TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
        record_json TEXT NOT NULL,
        updated_at  TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS documents (
        id         TEXT PRIMARY KEY,
        user_id    TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        name       TEXT NOT NULL,
        mime       TEXT NOT NULL,
        size_bytes INTEGER NOT NULL,
        content    BLOB NOT NULL,
        created_at TEXT NOT NULL
      );
      CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);
      CREATE INDEX IF NOT EXISTS idx_documents_user ON documents(user_id);
    `,
  },
  {
    version: 2,
    name: 'plans-and-document-analyses',
    sql: `
      ALTER TABLE users ADD COLUMN plan TEXT NOT NULL DEFAULT 'free';
      CREATE TABLE IF NOT EXISTS document_analyses (
        document_id TEXT PRIMARY KEY REFERENCES documents(id) ON DELETE CASCADE,
        user_id     TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        status      TEXT NOT NULL,             -- 'ok' | 'failed' | 'unsupported'
        model       TEXT,
        analysis_json TEXT,                    -- full structured analysis
        created_at  TEXT NOT NULL
      );
      CREATE INDEX IF NOT EXISTS idx_analyses_user ON document_analyses(user_id);
    `,
  },
]

function migrate() {
  const current = db.prepare('PRAGMA user_version').get().user_version as number
  for (const m of MIGRATIONS) {
    if (m.version <= current) continue
    db.exec('BEGIN')
    try {
      db.exec(m.sql)
      db.exec(`PRAGMA user_version = ${m.version}`)
      db.exec('COMMIT')
      // eslint-disable-next-line no-console
      console.log(`[db] migrated to v${m.version} (${m.name})`)
    } catch (err) {
      db.exec('ROLLBACK')
      throw new Error(`Migration v${m.version} (${m.name}) failed: ${err?.message ?? err}`)
    }
  }
}
migrate()

/**
 * Online backup: VACUUM INTO writes a consistent snapshot without blocking
 * readers. Keeps the newest `keep` snapshots in DATA_DIR/backups. Called by
 * `npm run backup` (cron this in production) and available for pre-deploy use.
 */
export function backupNow(keep = 14): string {
  const dir = join(DATA_DIR, 'backups')
  mkdirSync(dir, { recursive: true })
  const stamp = new Date().toISOString().replace(/[:.]/g, '-')
  const target = join(dir, `app-${stamp}.db`)
  db.exec(`VACUUM INTO '${target.replace(/'/g, "''")}'`)
  const snapshots = readdirSync(dir)
    .filter((f) => f.startsWith('app-') && f.endsWith('.db'))
    .sort()
  for (const old of snapshots.slice(0, Math.max(0, snapshots.length - keep))) {
    unlinkSync(join(dir, old))
  }
  return target
}

export const now = () => new Date().toISOString()
export const uuid = () => randomUUID()
