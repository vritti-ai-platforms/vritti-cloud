import { numeric, timestamp, uuid, varchar, uniqueIndex } from '@vritti/api-sdk/drizzle-pg-core';
import { cloudSchema } from './cloud-schema';
import { apps } from './app';
import { cloudProviders } from './cloud-provider';
import { regions } from './region';

// Addon pricing per region + provider — no row means addon is not available in that region/provider
export const appPrices = cloudSchema.table(
  'app_prices',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    appId: uuid('app_id')
      .notNull()
      .references(() => apps.id, { onDelete: 'cascade' }),
    regionId: uuid('region_id')
      .notNull()
      .references(() => regions.id, { onDelete: 'cascade' }),
    cloudProviderId: uuid('cloud_provider_id')
      .notNull()
      .references(() => cloudProviders.id, { onDelete: 'cascade' }),
    monthlyPrice: numeric('monthly_price', { precision: 10, scale: 2 }).notNull(),
    currency: varchar('currency', { length: 3 }).notNull().default('INR'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).$onUpdate(() => new Date()),
  },
  (table) => [uniqueIndex('app_price_unique_idx').on(table.appId, table.regionId, table.cloudProviderId)],
);

export type AppPrice = typeof appPrices.$inferSelect;
export type NewAppPrice = typeof appPrices.$inferInsert;
