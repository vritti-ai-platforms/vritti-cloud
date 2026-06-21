import { uniqueIndex, uuid } from '@vritti/api-sdk/drizzle-pg-core';
import { cloudSchema } from './cloud-schema';
import { appPlatformEnum } from './enums';
import { featurePermissions } from './feature-permission';
import { roleTemplates } from './role-template';
import { versions } from './version';

// Role-level permission grants — maps a role template to a concrete feature permission row, per platform
export const roleTemplateFeaturePermissions = cloudSchema.table(
  'role_template_feature_permissions',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    versionId: uuid('version_id')
      .notNull()
      .references(() => versions.id, { onDelete: 'cascade' }),
    roleTemplateId: uuid('role_template_id')
      .notNull()
      .references(() => roleTemplates.id, { onDelete: 'cascade' }),
    featurePermissionId: uuid('feature_permission_id')
      .notNull()
      .references(() => featurePermissions.id, { onDelete: 'cascade' }),
    platform: appPlatformEnum('platform').notNull(),
  },
  (table) => [
    uniqueIndex('role_template_feature_permission_unique_idx').on(
      table.roleTemplateId,
      table.featurePermissionId,
      table.platform,
    ),
  ],
);

export type RoleTemplateFeaturePermission = typeof roleTemplateFeaturePermissions.$inferSelect;
export type NewRoleTemplateFeaturePermission = typeof roleTemplateFeaturePermissions.$inferInsert;
