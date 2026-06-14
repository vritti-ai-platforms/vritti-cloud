import { bigint, timestamp, uniqueIndex, uuid } from '@vritti/api-sdk/drizzle-pg-core';
import { cloudSchema } from './cloud-schema';
import { billingPeriodEnum } from './enums';
import { markets } from './market';
import { plans } from './plan';

// Plan pricing per market and billing period — amount in the market currency's minor units
export const planPrices = cloudSchema.table(
  'plan_prices',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    planId: uuid('plan_id')
      .notNull()
      .references(() => plans.id, { onDelete: 'restrict' }),
    marketId: uuid('market_id')
      .notNull()
      .references(() => markets.id, { onDelete: 'restrict' }),
    billingPeriod: billingPeriodEnum('billing_period').notNull(),
    amount: bigint('amount', { mode: 'number' }).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).$onUpdate(() => new Date()),
  },
  (table) => [uniqueIndex('plan_price_unique_idx').on(table.planId, table.marketId, table.billingPeriod)],
);

export type PlanPrice = typeof planPrices.$inferSelect;
export type NewPlanPrice = typeof planPrices.$inferInsert;
