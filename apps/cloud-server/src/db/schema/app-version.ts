import { jsonb, timestamp, uuid, varchar } from '@vritti/api-sdk/drizzle-pg-core';
import { cloudSchema } from './cloud-schema';
import { appVersionStatusEnum } from './enums';

// Versioned snapshots of the product catalog — all catalog entities belong to one version
export const appVersions = cloudSchema.table('app_versions', {
  id: uuid('id').primaryKey().defaultRandom(),
  version: varchar('version', { length: 50 }).notNull().unique(),
  name: varchar('name', { length: 255 }).notNull(),
  status: appVersionStatusEnum('status').notNull().default('DRAFT'),
  parentVersionId: uuid('parent_version_id'),
  snapshot: jsonb('snapshot'),
  artifacts: jsonb('artifacts'),
  finalizedAt: timestamp('finalized_at', { withTimezone: true }),
  readyAt: timestamp('ready_at', { withTimezone: true }),
  publishedAt: timestamp('published_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export type AppVersion = typeof appVersions.$inferSelect;
export type NewAppVersion = typeof appVersions.$inferInsert;
