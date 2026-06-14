import { primaryKey, uuid } from '@vritti/api-sdk/drizzle-pg-core';
import { cloudSchema } from './cloud-schema';
import { deployments } from './deployment';
import { plans } from './plan';

// Which plans are provisioned on a deployment
export const deploymentPlans = cloudSchema.table(
  'deployment_plans',
  {
    deploymentId: uuid('deployment_id')
      .notNull()
      .references(() => deployments.id, { onDelete: 'cascade' }),
    planId: uuid('plan_id')
      .notNull()
      .references(() => plans.id, { onDelete: 'restrict' }),
  },
  (table) => [primaryKey({ columns: [table.deploymentId, table.planId] })],
);

export type DeploymentPlan = typeof deploymentPlans.$inferSelect;
export type NewDeploymentPlan = typeof deploymentPlans.$inferInsert;
