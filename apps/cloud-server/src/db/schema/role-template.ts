import { text, timestamp, uniqueIndex, uuid, varchar } from '@vritti/api-sdk/drizzle-pg-core';
import { businesses } from './business';
import { cloudSchema } from './cloud-schema';
import { scopeTypeEnum, siteAppliesEnum } from './enums';
import { versions } from './version';

// Role templates scoped to an app version — admin-created, seeded to orgs via webhooks
export const roleTemplates = cloudSchema.table(
  'role_templates',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    versionId: uuid('version_id')
      .notNull()
      .references(() => versions.id, { onDelete: 'cascade' }),
    // Stable single-word kebab code — the durable link to provisioned org roles (survives renames, unlike id)
    code: varchar('code', { length: 255 }).notNull(),
    name: varchar('name', { length: 255 }).notNull(),
    description: text('description'),
    scope: scopeTypeEnum('scope').notNull().default('SITE'),
    // Single site type a SITE-scoped template targets (drives authoring filters + site role compatibility); ignored for other scopes
    siteType: siteAppliesEnum('site_type').notNull().default('OUTLET'),
    businessId: uuid('business_id')
      .notNull()
      .references(() => businesses.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).$onUpdate(() => new Date()),
  },
  // Role templates are per business — name and code are each unique within (version, business)
  (table) => [
    uniqueIndex('role_template_version_business_name_idx').on(table.versionId, table.businessId, table.name),
    uniqueIndex('role_template_version_business_code_idx').on(table.versionId, table.businessId, table.code),
  ],
);

export type RoleTemplate = typeof roleTemplates.$inferSelect;
export type NewRoleTemplate = typeof roleTemplates.$inferInsert;
