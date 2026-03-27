import { boolean, integer, text, timestamp, uuid, varchar, uniqueIndex } from '@vritti/api-sdk/drizzle-pg-core';
import { cloudSchema } from './cloud-schema';
import { appVersions } from './version';

// Curated feature bundles scoped to an app version
export const apps = cloudSchema.table(
  'apps',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    appVersionId: uuid('app_version_id')
      .notNull()
      .references(() => appVersions.id, { onDelete: 'cascade' }),
    code: varchar('code', { length: 100 }).notNull(),
    name: varchar('name', { length: 255 }).notNull(),
    description: text('description'),
    icon: varchar('icon', { length: 255 }),
    isActive: boolean('is_active').notNull().default(true),
    sortOrder: integer('sort_order').notNull().default(0),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).$onUpdate(() => new Date()),
  },
  (table) => [uniqueIndex('app_version_code_idx').on(table.appVersionId, table.code)],
);

export type App = typeof apps.$inferSelect;
export type NewApp = typeof apps.$inferInsert;
