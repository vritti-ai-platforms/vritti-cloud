import { integer, text, timestamp, uuid, varchar, uniqueIndex } from '@vritti/api-sdk/drizzle-pg-core';
import { cloudSchema } from './cloud-schema';
import { plans } from './plan';

// Links plan to apps by code string — null includedFeatureCodes means all features
export const planApps = cloudSchema.table(
  'plan_apps',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    planId: uuid('plan_id')
      .notNull()
      .references(() => plans.id, { onDelete: 'cascade' }),
    appCode: varchar('app_code', { length: 100 }).notNull(),
    includedFeatureCodes: text('included_feature_codes').array(),
    sortOrder: integer('sort_order').notNull().default(0),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [uniqueIndex('plan_app_unique_idx').on(table.planId, table.appCode)],
);

export type PlanApp = typeof planApps.$inferSelect;
export type NewPlanApp = typeof planApps.$inferInsert;
