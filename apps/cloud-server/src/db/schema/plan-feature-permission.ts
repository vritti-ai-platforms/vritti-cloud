import { timestamp, uniqueIndex, uuid } from '@vritti/api-sdk/drizzle-pg-core';
import { cloudSchema } from './cloud-schema';
import { featurePermissions } from './feature-permission';
import { plans } from './plan';
import { planFeatures } from './plan-feature';

// A plan's UNLOCKED action permission under a plan feature membership. Platform comes from the parent
// membership (plan_features); a (membership, permission) pair absent here renders locked (upsell).
export const planFeaturePermissions = cloudSchema.table(
  'plan_feature_permissions',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    planId: uuid('plan_id')
      .notNull()
      .references(() => plans.id, { onDelete: 'cascade' }),
    planFeatureId: uuid('plan_feature_id')
      .notNull()
      .references(() => planFeatures.id, { onDelete: 'cascade' }),
    featurePermissionId: uuid('feature_permission_id')
      .notNull()
      .references(() => featurePermissions.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [uniqueIndex('plan_feature_permission_unique_idx').on(table.planFeatureId, table.featurePermissionId)],
);

export type PlanFeaturePermission = typeof planFeaturePermissions.$inferSelect;
export type NewPlanFeaturePermission = typeof planFeaturePermissions.$inferInsert;
