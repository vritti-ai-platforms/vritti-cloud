import { integer, timestamp, uniqueIndex, uuid, varchar } from '@vritti/api-sdk/drizzle-pg-core';
import { cloudSchema } from './cloud-schema';
import { plans } from './plan';

// Links a plan to the apps it includes (by code); the unlocked permission set lives in plan_feature_permissions
export const planApps = cloudSchema.table(
  'plan_apps',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    planId: uuid('plan_id')
      .notNull()
      .references(() => plans.id, { onDelete: 'cascade' }),
    appCode: varchar('app_code', { length: 100 }).notNull(),
    sortOrder: integer('sort_order').notNull().default(0),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [uniqueIndex('plan_app_unique_idx').on(table.planId, table.appCode)],
);

export type PlanApp = typeof planApps.$inferSelect;
export type NewPlanApp = typeof planApps.$inferInsert;
