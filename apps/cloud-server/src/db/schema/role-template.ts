import { boolean, text, timestamp, uuid, varchar, uniqueIndex } from '@vritti/api-sdk/drizzle-pg-core';
import { cloudSchema } from './cloud-schema';
import { versions } from './version';
import { roleScopeEnum } from './enums';
import { industries } from './industry';

// Role templates scoped to an app version — admin-created, seeded to orgs via webhooks
export const roleTemplates = cloudSchema.table(
  'role_templates',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    versionId: uuid('version_id')
      .notNull()
      .references(() => versions.id, { onDelete: 'cascade' }),
    name: varchar('name', { length: 255 }).notNull(),
    description: text('description'),
    scope: roleScopeEnum('scope').notNull(),
    industryId: uuid('industry_id').references(() => industries.id, { onDelete: 'set null' }),
    isSystem: boolean('is_system').notNull().default(false),
    isActive: boolean('is_active').notNull().default(true),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).$onUpdate(() => new Date()),
  },
  (table) => [uniqueIndex('role_template_version_name_idx').on(table.versionId, table.name)],
);

export type RoleTemplate = typeof roleTemplates.$inferSelect;
export type NewRoleTemplate = typeof roleTemplates.$inferInsert;
