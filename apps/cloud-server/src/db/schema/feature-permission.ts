import { uniqueIndex, uuid } from '@vritti/api-sdk/drizzle-pg-core';
import { cloudSchema } from './cloud-schema';
import { featureTypeEnum } from './enums';
import { features } from './feature';
import { versions } from './version';

// Declared permission types for a feature — defines what actions are possible
export const featurePermissions = cloudSchema.table(
  'feature_permissions',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    versionId: uuid('version_id')
      .notNull()
      .references(() => versions.id, { onDelete: 'cascade' }),
    featureId: uuid('feature_id')
      .notNull()
      .references(() => features.id, { onDelete: 'cascade' }),
    type: featureTypeEnum('type').notNull(),
  },
  (table) => [uniqueIndex('feature_permission_unique_idx').on(table.featureId, table.type)],
);

export type FeaturePermission = typeof featurePermissions.$inferSelect;
export type NewFeaturePermission = typeof featurePermissions.$inferInsert;
