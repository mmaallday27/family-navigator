// `npm run backup` — takes a consistent online snapshot of the database into
// DATA_DIR/backups (keeps the newest 14). Cron this in production; for offsite
// protection, sync DATA_DIR/backups to object storage, or run Litestream for
// continuous replication (see docs/OPERATIONS.md).

import { backupNow, db } from './db' // db.ts loads .env itself

const target = backupNow()
// eslint-disable-next-line no-console
console.log(`[backup] snapshot written: ${target}`)
db.close()
