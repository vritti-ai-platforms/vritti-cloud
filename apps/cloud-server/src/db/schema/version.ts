import { jsonb, timestamp, uuid, varchar } from '@vritti/api-sdk/drizzle-pg-core';
import { cloudSchema } from './cloud-schema';
import { versionStatusEnum } from './enums';

// Versioned snapshots of the product catalog — all catalog entities belong to one version
export const appVersions = cloudSchema.table('app_versions', {
  id: uuid('id').primaryKey().defaultRandom(),
  version: varchar('version', { length: 50 }).notNull().unique(),
  name: varchar('name', { length: 255 }).notNull(),
  status: versionStatusEnum('status').notNull().default('ALPHA'),
  parentVersionId: uuid('parent_version_id'),
  snapshot: jsonb('snapshot'),
  artifacts: jsonb('artifacts'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export type Version = typeof appVersions.$inferSelect;
export type NewVersion = typeof appVersions.$inferInsert;
