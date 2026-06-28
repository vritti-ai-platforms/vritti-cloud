import { uniqueIndex, uuid } from '@vritti/api-sdk/drizzle-pg-core';
import { cloudSchema } from './cloud-schema';
import { appPlatformEnum } from './enums';
import { features } from './feature';
import { plans } from './plan';
import { versions } from './version';

// Explicit feature membership for a plan, per platform. Presence here = the plan includes (unlocks) the
// feature on that platform; its unlocked action permissions live in plan_feature_permissions (cascade).
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
    featureId: uuid('feature_id')
      .notNull()
      .references(() => features.id, { onDelete: 'cascade' }),
    platform: appPlatformEnum('platform').notNull(),
  },
  (table) => [uniqueIndex('plan_feature_unique_idx').on(table.planId, table.featureId, table.platform)],
);

export type PlanFeature = typeof planFeatures.$inferSelect;
export type NewPlanFeature = typeof planFeatures.$inferInsert;
