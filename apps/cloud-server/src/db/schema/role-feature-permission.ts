import { uuid, uniqueIndex } from '@vritti/api-sdk/drizzle-pg-core';
import { cloudSchema } from './cloud-schema';
import { appVersions } from './app-version';
import { roles } from './role';
import { features } from './feature';
import { featureTypeEnum } from './enums';

// Role-level permission grants — maps a role to specific feature permission types
export const roleFeaturePermissions = cloudSchema.table(
  'role_feature_permissions',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    appVersionId: uuid('app_version_id')
      .notNull()
      .references(() => appVersions.id, { onDelete: 'cascade' }),
    roleId: uuid('role_id')
      .notNull()
      .references(() => roles.id, { onDelete: 'cascade' }),
    featureId: uuid('feature_id')
      .notNull()
      .references(() => features.id, { onDelete: 'cascade' }),
    type: featureTypeEnum('type').notNull(),
  },
  (table) => [uniqueIndex('role_feature_permission_unique_idx').on(table.roleId, table.featureId, table.type)],
);

export type RoleFeaturePermission = typeof roleFeaturePermissions.$inferSelect;
export type NewRoleFeaturePermission = typeof roleFeaturePermissions.$inferInsert;
