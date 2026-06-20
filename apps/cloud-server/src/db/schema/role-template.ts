import { text, timestamp, uniqueIndex, uuid, varchar } from '@vritti/api-sdk/drizzle-pg-core';
import { businesses } from './business';
import { cloudSchema } from './cloud-schema';
import { roleScopeEnum } from './enums';
import { versions } from './version';

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
    businessId: uuid('business_id')
      .notNull()
      .references(() => businesses.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).$onUpdate(() => new Date()),
  },
  // Role templates are per business — a name is unique within (version, business), not across the whole version
  (table) => [uniqueIndex('role_template_version_business_name_idx').on(table.versionId, table.businessId, table.name)],
);

export type RoleTemplate = typeof roleTemplates.$inferSelect;
export type NewRoleTemplate = typeof roleTemplates.$inferInsert;
