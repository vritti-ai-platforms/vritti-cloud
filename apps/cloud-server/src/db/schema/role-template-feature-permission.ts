import { uuid, uniqueIndex } from '@vritti/api-sdk/drizzle-pg-core';
import { cloudSchema } from './cloud-schema';
import { versions } from './version';
import { roleTemplates } from './role-template';
import { features } from './feature';
import { featureTypeEnum } from './enums';

// Role-level permission grants — maps a role template to specific feature permission types
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
    featureId: uuid('feature_id')
      .notNull()
      .references(() => features.id, { onDelete: 'cascade' }),
    type: featureTypeEnum('type').notNull(),
  },
  (table) => [uniqueIndex('role_template_feature_permission_unique_idx').on(table.roleTemplateId, table.featureId, table.type)],
);

export type RoleTemplateFeaturePermission = typeof roleTemplateFeaturePermissions.$inferSelect;
export type NewRoleTemplateFeaturePermission = typeof roleTemplateFeaturePermissions.$inferInsert;
