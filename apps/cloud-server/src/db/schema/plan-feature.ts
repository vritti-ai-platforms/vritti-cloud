import { foreignKey, uniqueIndex, uuid } from '@vritti/api-sdk/drizzle-pg-core';
import { businessAppFeatures } from './app-feature';
import { businesses } from './business';
import { cloudSchema } from './cloud-schema';
import { appPlatformEnum } from './enums';
import { features } from './feature';
import { plans } from './plan';
import { versions } from './version';

export const planFeatures = cloudSchema.table(
  'plan_features',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    versionId: uuid('version_id')
      .notNull()
      .references(() => versions.id, { onDelete: 'cascade' }),
    planId: uuid('plan_id')
      .notNull()
      .references(() => plans.id, { onDelete: 'cascade' }),
    businessId: uuid('business_id')
      .notNull()
      .references(() => businesses.id, { onDelete: 'cascade' }),
    featureId: uuid('feature_id')
      .notNull()
      .references(() => features.id, { onDelete: 'cascade' }),
    platform: appPlatformEnum('platform').notNull(),
  },
  (table) => [
    uniqueIndex('plan_feature_unique_idx').on(table.planId, table.featureId, table.platform),
    // Membership follows the feature's app pin: unassigning the feature (deleting its app_features row) cascades here
    foreignKey({
      columns: [table.businessId, table.featureId],
      foreignColumns: [businessAppFeatures.businessId, businessAppFeatures.featureId],
      name: 'plan_feature_app_fk',
    }).onDelete('cascade'),
  ],
);

export type PlanFeature = typeof planFeatures.$inferSelect;
export type NewPlanFeature = typeof planFeatures.$inferInsert;
