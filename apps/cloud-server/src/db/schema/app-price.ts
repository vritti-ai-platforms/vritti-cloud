import { bigint, timestamp, uniqueIndex, uuid } from '@vritti/api-sdk/drizzle-pg-core';
import { apps } from './app';
import { cloudSchema } from './cloud-schema';
import { countries } from './country';
import { billingPeriodEnum } from './enums';

// Addon pricing per country + billing period — amount in the country's default-currency minor units
export const appPrices = cloudSchema.table(
  'app_prices',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    appId: uuid('app_id')
      .notNull()
      .references(() => apps.id, { onDelete: 'cascade' }),
    countryId: uuid('country_id')
      .notNull()
      .references(() => countries.id, { onDelete: 'cascade' }),
    billingPeriod: billingPeriodEnum('billing_period').notNull(),
    amount: bigint('amount', { mode: 'number' }).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).$onUpdate(() => new Date()),
  },
  (table) => [uniqueIndex('app_price_unique_idx').on(table.appId, table.countryId, table.billingPeriod)],
);

export type AppPrice = typeof appPrices.$inferSelect;
export type NewAppPrice = typeof appPrices.$inferInsert;
