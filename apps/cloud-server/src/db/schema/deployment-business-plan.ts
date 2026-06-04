import { primaryKey, uuid } from '@vritti/api-sdk/drizzle-pg-core';
import { businesses } from './business';
import { cloudSchema } from './cloud-schema';
import { deployments } from './deployment';
import { plans } from './plan';

export const deploymentBusinessPlans = cloudSchema.table(
  'deployment_business_plans',
  {
    deploymentId: uuid('deployment_id')
      .notNull()
      .references(() => deployments.id, { onDelete: 'cascade' }),
    planId: uuid('plan_id')
      .notNull()
      .references(() => plans.id, { onDelete: 'restrict' }),
    businessId: uuid('business_id')
      .notNull()
      .references(() => businesses.id, { onDelete: 'restrict' }),
  },
  (table) => [primaryKey({ columns: [table.deploymentId, table.planId, table.businessId] })],
);

export type DeploymentBusinessPlan = typeof deploymentBusinessPlans.$inferSelect;
export type NewDeploymentBusinessPlan = typeof deploymentBusinessPlans.$inferInsert;
