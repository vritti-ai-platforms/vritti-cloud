import { sql } from '@vritti/api-sdk/drizzle-orm';
import { check, uniqueIndex, uuid, varchar } from '@vritti/api-sdk/drizzle-pg-core';
import { cloudSchema } from './cloud-schema';
import { appPlatformEnum } from './enums';
import { versions } from './version';

// Microfrontend deployments scoped to an app version — one per code+platform combo.
// WEB rows fill `remoteEntry`; MOBILE rows fill `remoteEntryAndroid` + `remoteEntryIos`.
// The CHECK constraint enforces this invariant at the DB layer.
export const microfrontends = cloudSchema.table(
  'microfrontends',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    versionId: uuid('version_id')
      .notNull()
      .references(() => versions.id, { onDelete: 'cascade' }),
    code: varchar('code', { length: 100 }).notNull(),
    name: varchar('name', { length: 255 }).notNull(),
    platform: appPlatformEnum('platform').notNull(),
    remoteEntry: varchar('remote_entry', { length: 500 }),
    remoteEntryAndroid: varchar('remote_entry_android', { length: 500 }),
    remoteEntryIos: varchar('remote_entry_ios', { length: 500 }),
  },
  (table) => [
    uniqueIndex('microfrontend_version_code_platform_idx').on(table.versionId, table.code, table.platform),
    check(
      'microfrontend_url_per_platform_chk',
      sql`(${table.platform} = 'WEB' AND ${table.remoteEntry} IS NOT NULL AND ${table.remoteEntryAndroid} IS NULL AND ${table.remoteEntryIos} IS NULL)
       OR (${table.platform} = 'MOBILE' AND ${table.remoteEntry} IS NULL AND ${table.remoteEntryAndroid} IS NOT NULL AND ${table.remoteEntryIos} IS NOT NULL)`,
    ),
  ],
);

export type Microfrontend = typeof microfrontends.$inferSelect;
export type NewMicrofrontend = typeof microfrontends.$inferInsert;
