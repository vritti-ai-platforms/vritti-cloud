import { timestamp, uuid, uniqueIndex } from '@vritti/api-sdk/drizzle-pg-core';
import { cloudSchema } from './cloud-schema';
import { versions } from './version';
import { apps } from './app';
import { roleTemplates } from './role-template';

// Links a role template to the apps it covers within an app version
export const roleTemplateApps = cloudSchema.table(
  'role_template_apps',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    versionId: uuid('version_id')
      .notNull()
      .references(() => versions.id, { onDelete: 'cascade' }),
    roleTemplateId: uuid('role_template_id')
      .notNull()
      .references(() => roleTemplates.id, { onDelete: 'cascade' }),
    appId: uuid('app_id')
      .notNull()
      .references(() => apps.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [uniqueIndex('role_template_app_unique_idx').on(table.roleTemplateId, table.appId)],
);

export type RoleTemplateApp = typeof roleTemplateApps.$inferSelect;
export type NewRoleTemplateApp = typeof roleTemplateApps.$inferInsert;
