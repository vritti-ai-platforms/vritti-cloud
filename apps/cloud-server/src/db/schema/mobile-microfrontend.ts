import { uniqueIndex, uuid, varchar } from '@vritti/api-sdk/drizzle-pg-core';
import { cloudSchema } from './cloud-schema';
import { versions } from './version';

// Mobile microfrontend deployments scoped to an app version — one per code.
// A mobile MF always has both an Android and an iOS remote entry (both NOT NULL).
export const mobileMicrofrontends = cloudSchema.table(
  'mobile_microfrontends',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    versionId: uuid('version_id')
      .notNull()
      .references(() => versions.id, { onDelete: 'cascade' }),
    code: varchar('code', { length: 100 }).notNull(),
    name: varchar('name', { length: 255 }).notNull(),
    remoteEntryAndroid: varchar('remote_entry_android', { length: 500 }).notNull(),
    remoteEntryIos: varchar('remote_entry_ios', { length: 500 }).notNull(),
  },
  (table) => [uniqueIndex('mobile_microfrontend_version_code_idx').on(table.versionId, table.code)],
);

export type MobileMicrofrontend = typeof mobileMicrofrontends.$inferSelect;
export type NewMobileMicrofrontend = typeof mobileMicrofrontends.$inferInsert;
