import path from 'node:path';
import { runMigrationsAndGrants } from '@vritti/api-sdk/migrate';

// Release-phase one-shot: apply migrations as owner, then grant the runtime role (run via `node dist/db/migrate.js`).
runMigrationsAndGrants({
  migrationsFolder: path.join(__dirname, 'migrations'),
  migrationsTable: '__drizzle_migrations_cloud',
}).catch((error) => {
  console.error('[migrate] failed:', error);
  process.exit(1);
});
