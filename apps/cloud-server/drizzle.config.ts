import { defineConfig } from 'drizzle-kit';

const dbUrl = process.env.PRIMARY_DB_DATABASE_DIRECT_URL;
if (!dbUrl) {
  throw new Error('PRIMARY_DB_DATABASE_DIRECT_URL environment variable is required');
}

const dbSchema = process.env.PRIMARY_DB_SCHEMA;
if (!dbSchema) {
  throw new Error('PRIMARY_DB_SCHEMA environment variable is required');
}

const migrationSchema = process.env.PRIMARY_DB_MIGRATION_SCHEMA;
if (!migrationSchema) {
  throw new Error('PRIMARY_DB_MIGRATION_SCHEMA environment variable is required');
}

export default defineConfig({
  schema: './src/db/schema/index.ts',
  out: './src/db/migrations',
  dialect: 'postgresql',
  schemaFilter: [dbSchema],
  dbCredentials: {
    url: dbUrl,
  },
  migrations: {
    table: '__drizzle_migrations_cloud',
    schema: migrationSchema,
  },
  verbose: true,
  strict: true,
});
