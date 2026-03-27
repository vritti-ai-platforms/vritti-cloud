import { uniqueIndex, uuid, varchar } from '@vritti/api-sdk/drizzle-pg-core';
import { cloudSchema } from './cloud-schema';
import { appPlatformEnum } from './enums';
import { versions } from './version';

// Microfrontend deployments scoped to an app version — one per code+platform combo
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
    remoteEntry: varchar('remote_entry', { length: 500 }).notNull(),
  },
  (table) => [uniqueIndex('microfrontend_version_code_platform_idx').on(table.versionId, table.code, table.platform)],
);

export type Microfrontend = typeof microfrontends.$inferSelect;
export type NewMicrofrontend = typeof microfrontends.$inferInsert;
