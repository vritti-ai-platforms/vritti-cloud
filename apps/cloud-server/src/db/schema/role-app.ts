import { timestamp, uuid, uniqueIndex } from '@vritti/api-sdk/drizzle-pg-core';
import { cloudSchema } from './cloud-schema';
import { versions } from './version';
import { apps } from './app';
import { roles } from './role';

// Links a role template to the apps it covers within an app version
export const roleApps = cloudSchema.table(
  'role_apps',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    versionId: uuid('version_id')
      .notNull()
      .references(() => versions.id, { onDelete: 'cascade' }),
    roleId: uuid('role_id')
      .notNull()
      .references(() => roles.id, { onDelete: 'cascade' }),
    appId: uuid('app_id')
      .notNull()
      .references(() => apps.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [uniqueIndex('role_app_unique_idx').on(table.roleId, table.appId)],
);

export type RoleApp = typeof roleApps.$inferSelect;
export type NewRoleApp = typeof roleApps.$inferInsert;
