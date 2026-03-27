import { boolean, text, timestamp, uuid, varchar, uniqueIndex } from '@vritti/api-sdk/drizzle-pg-core';
import { cloudSchema } from './cloud-schema';
import { appVersions } from './version';
import { roleScopeEnum } from './enums';
import { industries } from './industry';

// Role templates scoped to an app version — admin-created, seeded to orgs via webhooks
export const roles = cloudSchema.table(
  'roles',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    appVersionId: uuid('app_version_id')
      .notNull()
      .references(() => appVersions.id, { onDelete: 'cascade' }),
    name: varchar('name', { length: 255 }).notNull(),
    description: text('description'),
    scope: roleScopeEnum('scope').notNull(),
    industryId: uuid('industry_id').references(() => industries.id, { onDelete: 'set null' }),
    isSystem: boolean('is_system').notNull().default(false),
    isActive: boolean('is_active').notNull().default(true),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).$onUpdate(() => new Date()),
  },
  (table) => [uniqueIndex('role_version_name_idx').on(table.appVersionId, table.name)],
);

export type Role = typeof roles.$inferSelect;
export type NewRole = typeof roles.$inferInsert;
