// Persistence layer. Uses Node's built-in SQLite (node:sqlite) — zero native
// dependencies, so it runs anywhere Node 22+ does with no build step. The
// schema is deliberately standard SQL: porting to Postgres for a cloud
// deployment is a driver swap, not a rewrite. The family owns their data
// (Blueprint trust doctrine): everything here is exportable and deletable.

// node:sqlite is experimental in Node; it has no @types yet, so we run the
// server via tsx (transpile-only) and keep types loose in this module.
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import { DatabaseSync } from 'node:sqlite'
import { mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { randomUUID } from 'node:crypto'

const DB_PATH = resolve(process.cwd(), 'server/data/app.db')
mkdirSync(dirname(DB_PATH), { recursive: true })

export const db = new DatabaseSync(DB_PATH)

db.exec(`
  PRAGMA journal_mode = WAL;
  PRAGMA foreign_keys = ON;

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
`)

export const now = () => new Date().toISOString()
export const uuid = () => randomUUID()
