import { uniqueIndex, uuid } from '@vritti/api-sdk/drizzle-pg-core';
import { cloudSchema } from './cloud-schema';
import { appPlatformEnum } from './enums';
import { features } from './feature';
import { roleTemplates } from './role-template';
import { versions } from './version';

// Explicit feature membership for a role template, per platform. Presence here = the feature is in the
// role (the View/route gate); its action grants live in role_template_feature_permissions (cascade).
export const roleTemplateFeatures = cloudSchema.table(
  'role_template_features',
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
    platform: appPlatformEnum('platform').notNull(),
  },
  (table) => [
    uniqueIndex('role_template_feature_unique_idx').on(table.roleTemplateId, table.featureId, table.platform),
  ],
);

export type RoleTemplateFeature = typeof roleTemplateFeatures.$inferSelect;
export type NewRoleTemplateFeature = typeof roleTemplateFeatures.$inferInsert;
