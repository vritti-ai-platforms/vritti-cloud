import { bigint, timestamp, uniqueIndex, uuid } from '@vritti/api-sdk/drizzle-pg-core';
import { billingCycles } from './billing-cycle';
import { cloudSchema } from './cloud-schema';
import { countries } from './country';
import { plans } from './plan';

// Plan pricing per country and billing cycle — amount in the country's default-currency minor units
export const planPrices = cloudSchema.table(
  'plan_prices',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    planId: uuid('plan_id')
      .notNull()
      .references(() => plans.id, { onDelete: 'restrict' }),
    countryId: uuid('country_id')
      .notNull()
      .references(() => countries.id, { onDelete: 'restrict' }),
    billingCycleId: uuid('billing_cycle_id')
      .notNull()
      .references(() => billingCycles.id, { onDelete: 'restrict' }),
    amount: bigint('amount', { mode: 'bigint' }).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).$onUpdate(() => new Date()),
  },
  (table) => [uniqueIndex('plan_price_unique_idx').on(table.planId, table.countryId, table.billingCycleId)],
);

export type PlanPrice = typeof planPrices.$inferSelect;
export type NewPlanPrice = typeof planPrices.$inferInsert;
