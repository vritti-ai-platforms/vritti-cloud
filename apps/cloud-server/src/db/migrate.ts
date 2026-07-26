import path from 'node:path';
import { runMigrationsAndGrants } from '@vritti/api-sdk/migrate';

const schema = process.env.PRIMARY_DB_SCHEMA;
const migrationSchema = process.env.PRIMARY_DB_MIGRATION_SCHEMA;
if (!schema || !migrationSchema) {
  throw new Error('PRIMARY_DB_SCHEMA and PRIMARY_DB_MIGRATION_SCHEMA are required');
}

// Release-phase one-shot: apply migrations as owner, then grant the runtime role (run via `node dist/db/migrate.js`).
runMigrationsAndGrants({
  migrationsFolder: path.join(__dirname, 'migrations'),
  migrationsTable: '__drizzle_migrations_cloud',
  schema,
  migrationSchema,
}).catch((error) => {
  console.error('[migrate] failed:', error);
  process.exit(1);
});
