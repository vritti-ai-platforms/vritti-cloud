import { bigint, timestamp, uniqueIndex, uuid } from '@vritti/api-sdk/drizzle-pg-core';
import { apps } from './app';
import { cloudSchema } from './cloud-schema';
import { billingPeriodEnum } from './enums';
import { markets } from './market';

// Addon pricing per market + billing period — amount in the market currency's minor units
export const appPrices = cloudSchema.table(
  'app_prices',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    appId: uuid('app_id')
      .notNull()
      .references(() => apps.id, { onDelete: 'cascade' }),
    marketId: uuid('market_id')
      .notNull()
      .references(() => markets.id, { onDelete: 'cascade' }),
    billingPeriod: billingPeriodEnum('billing_period').notNull(),
    amount: bigint('amount', { mode: 'number' }).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).$onUpdate(() => new Date()),
  },
  (table) => [uniqueIndex('app_price_unique_idx').on(table.appId, table.marketId, table.billingPeriod)],
);

export type AppPrice = typeof appPrices.$inferSelect;
export type NewAppPrice = typeof appPrices.$inferInsert;
