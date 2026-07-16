# Family Navigator — Operations & Architecture Decisions

*Last updated: July 15, 2026. This document is the operational contract for the
controlled pilot. If reality and this document disagree, fix one of them
deliberately.*

## Architecture decision: SQLite for the pilot, with a written exit

**Decision.** The pilot runs on Node's built-in SQLite (`node:sqlite`, WAL
mode) with document bytes stored as BLOBs in the same database, on a
persistent volume, with scripted snapshots.

**Why.** One process, one file to protect, zero native dependencies, atomic
transactions across records *and* documents, one-command backup/restore, and
every query is already parameterized and user-scoped. At pilot scale
(≤ hundreds of families) this is the most durable option per unit of
operational complexity — the failure modes we must survive (redeploys,
restarts, crashes) are solved by the volume + WAL + snapshots, not by a
bigger database.

**The exit trigger (non-negotiable, re-evaluate monthly).** Move to Postgres
(records) + S3-compatible object storage (documents) when ANY of:

- a second app process is needed (horizontal scaling or zero-downtime deploys),
- ~2,000 active families,
- ~50 GB of stored documents,
- a managed-database compliance requirement lands.

The schema is standard SQL and the document store is isolated behind
`server/documents.ts` / `server/plans.ts`, so the port is a driver swap plus a
blob copy script — not a rewrite. Do not let the pilot's success turn this
paragraph into a forgotten promise.

## Environment

| Variable | Required | Meaning |
| --- | --- | --- |
| `DATA_DIR` | production: **yes** | Directory holding `app.db` (+ WAL, backups). Point at a persistent volume. Defaults to `server/data/` for dev. |
| `NODE_ENV` | production: **yes** | `production` enables Secure cookies and silences the boot warning. |
| `PORT` | no | Default 8787. |
| `ANTHROPIC_API_KEY` | no | Enables the live navigator + document intelligence. Without it both degrade honestly (deterministic answers; analysis reports "not turned on"). |

Secrets live in `.env` (git-ignored, loaded by `server/db.ts` at boot) or the
platform's secret store. `.env.example` documents every variable. Never commit
a real key; never log one.

## Migrations

Schema is versioned via `PRAGMA user_version` (`server/db.ts`). Rules:

- Append-only: never edit a shipped migration; add the next numbered one.
- Migrations run in a transaction at boot; a failed migration aborts startup
  (fail loudly, not with a half-migrated schema).
- The family-record blob has its own client-side version (`FamilyState.version`,
  normalized in `fromServer`) — new fields must be added there with defaults.

## Backups & recovery

- `npm run backup` → consistent online snapshot via `VACUUM INTO` to
  `DATA_DIR/backups/app-<timestamp>.db`, keeping the newest 14.
- **Production: cron it nightly** and sync `DATA_DIR/backups/` offsite
  (object storage, `rclone`, etc.). The database contains families' legal and
  medical documents — offsite is not optional.
- Preferred upgrade: [Litestream](https://litestream.io/) streaming replication
  of `DATA_DIR/app.db` to object storage (continuous, second-level RPO).
- **Restore:** stop the server, copy the chosen snapshot to `DATA_DIR/app.db`
  (remove stale `app.db-wal`/`app.db-shm`), start the server, verify
  `/healthz` and one family login. **Drill this once before the pilot.**

## Deploy

- `Dockerfile` at the repo root: multi-stage, serves client + API from one
  process on :8787, `HEALTHCHECK` wired to `/healthz`, `VOLUME /data`.
- Any host works if it gives the container a persistent disk (Fly.io volume,
  Render disk, a VPS with Docker). **A host with an ephemeral filesystem will
  erase every family's record on deploy** unless `DATA_DIR` points at a volume.
- TLS terminates at the platform proxy; the app sets `trust proxy` and marks
  cookies Secure on TLS requests.
- Graceful shutdown on SIGTERM (in-flight requests finish, DB closes).
- **Staging:** run a second instance with its own volume and its own
  `ANTHROPIC_API_KEY` (or none). Never point staging at the production volume.
- Local dev: `npm run dev` (client :5173 proxying to API :8787, DB in
  `server/data/`).

## Monitoring

- `GET /healthz` — process + database probe; wire an uptime monitor to it.
- Logs: structured-enough console output — request errors
  (`[error] METHOD path -> status`), AI usage per call (`[navigator]`,
  `[analyze]` with user + token counts), migrations, backups. Ship container
  logs to the platform's log store; review AI usage weekly during the pilot
  (cost control).
- Rate limits are in-memory per process (fine while single-process; revisit at
  the Postgres trigger).

## Resource re-verification (state navigation intelligence)

Verified state resources live in `src/data/resourcesNY.ts` (+ milestones in
`stateGuidanceNY.ts`), each entry carrying `lastVerified` and, where a source
could not be robot-verified, a `verifyNote`. **Quarterly ritual:** re-check
every entry's URL/phone/age rules against the official source, update
`lastVerified`, and prune or flag anything that moved. NY facts most likely to
change: the age-22 aging-out rule (statutory codification pending as of
2026-07), ABLE contribution limits, MBI-WPD income figures, CCO lineup.
Adding a state = new `resources<ST>.ts` + `stateGuidance<ST>.ts` files feeding
the same registry (`src/data/stateRegistry.ts`) — never fork the reasoning.

## Storage plans & billing boundary

Entitlements live in `server/plans.ts` (free = 1 GB; `keeper` = 10 GB,
`available: false` until billing exists). Enforcement stops **new uploads
only** — viewing, export, and deletion are never gated, and nothing is ever
auto-deleted on plan change (Vault constitution).

**Billing recommendation (deliberately not implemented):** when pricing is
approved, wire Stripe Checkout + a webhook that flips `users.plan`. The
entitlement layer needs no changes. Do not ship a fake checkout in the
meantime; the UI renders "coming soon" honestly.

## Known items requiring legal counsel before broad (non-pilot) launch

- Privacy policy & Terms review (drafts live in the app; they claim no
  HIPAA/FERPA/COPPA certification — counsel should confirm the pilot posture
  and data-processing language, including Anthropic API data flows).
- Data-retention commitments (current stance: family data kept until the
  family deletes it; backups age out within ~14 days after deletion).
- NY-specific disclosures, if any, for platforms handling disability-related
  records of minors.
