import { uuid, varchar, uniqueIndex } from '@vritti/api-sdk/drizzle-pg-core';
import { cloudSchema } from './cloud-schema';
import { appVersions } from './version';
import { appPlatformEnum } from './enums';

// Microfrontend deployments scoped to an app version — one per code+platform combo
export const microfrontends = cloudSchema.table(
  'microfrontends',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    appVersionId: uuid('app_version_id')
      .notNull()
      .references(() => appVersions.id, { onDelete: 'cascade' }),
    code: varchar('code', { length: 100 }).notNull(),
    name: varchar('name', { length: 255 }).notNull(),
    platform: appPlatformEnum('platform').notNull(),
    remoteEntry: varchar('remote_entry', { length: 500 }).notNull(),
  },
  (table) => [uniqueIndex('microfrontend_version_code_platform_idx').on(table.appVersionId, table.code, table.platform)],
);

export type Microfrontend = typeof microfrontends.$inferSelect;
export type NewMicrofrontend = typeof microfrontends.$inferInsert;
