import { uniqueIndex, uuid, varchar } from '@vritti/api-sdk/drizzle-pg-core';
import { cloudSchema } from './cloud-schema';
import { versions } from './version';

export const webMicrofrontends = cloudSchema.table(
  'web_microfrontends',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    versionId: uuid('version_id')
      .notNull()
      .references(() => versions.id, { onDelete: 'cascade' }),
    code: varchar('code', { length: 100 }).notNull(),
    name: varchar('name', { length: 255 }).notNull(),
    remoteEntry: varchar('remote_entry', { length: 500 }).notNull(),
  },
  (table) => [uniqueIndex('web_microfrontend_version_code_idx').on(table.versionId, table.code)],
);

export type WebMicrofrontend = typeof webMicrofrontends.$inferSelect;
export type NewWebMicrofrontend = typeof webMicrofrontends.$inferInsert;
