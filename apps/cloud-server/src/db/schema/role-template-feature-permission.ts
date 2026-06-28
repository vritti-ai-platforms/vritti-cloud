import { uniqueIndex, uuid } from '@vritti/api-sdk/drizzle-pg-core';
import { cloudSchema } from './cloud-schema';
import { featurePermissions } from './feature-permission';
import { roleTemplates } from './role-template';
import { roleTemplateFeatures } from './role-template-feature';
import { versions } from './version';

// Role-level action grants under a role's feature membership. Platform comes from the parent membership
// row (role_template_features); deleting that membership cascade-deletes its grants.
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
    roleTemplateFeatureId: uuid('role_template_feature_id')
      .notNull()
      .references(() => roleTemplateFeatures.id, { onDelete: 'cascade' }),
    featurePermissionId: uuid('feature_permission_id')
      .notNull()
      .references(() => featurePermissions.id, { onDelete: 'cascade' }),
  },
  (table) => [
    uniqueIndex('role_template_feature_permission_unique_idx').on(
      table.roleTemplateFeatureId,
      table.featurePermissionId,
    ),
  ],
);

export type RoleTemplateFeaturePermission = typeof roleTemplateFeaturePermissions.$inferSelect;
export type NewRoleTemplateFeaturePermission = typeof roleTemplateFeaturePermissions.$inferInsert;
