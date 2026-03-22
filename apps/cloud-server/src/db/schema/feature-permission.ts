import { uuid, uniqueIndex } from '@vritti/api-sdk/drizzle-pg-core';
import { cloudSchema } from './cloud-schema';
import { appVersions } from './app-version';
import { features } from './feature';
import { featureTypeEnum } from './enums';

// Declared permission types for a feature — defines what actions are possible
export const featurePermissions = cloudSchema.table(
  'feature_permissions',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    appVersionId: uuid('app_version_id')
      .notNull()
      .references(() => appVersions.id, { onDelete: 'cascade' }),
    featureId: uuid('feature_id')
      .notNull()
      .references(() => features.id, { onDelete: 'cascade' }),
    type: featureTypeEnum('type').notNull(),
  },
  (table) => [uniqueIndex('feature_permission_unique_idx').on(table.featureId, table.type)],
);

export type FeaturePermission = typeof featurePermissions.$inferSelect;
export type NewFeaturePermission = typeof featurePermissions.$inferInsert;
