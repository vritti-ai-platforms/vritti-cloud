import { timestamp, uniqueIndex, uuid } from '@vritti/api-sdk/drizzle-pg-core';
import { cloudSchema } from './cloud-schema';
import { countries } from './country';
import { markets } from './market';

// Maps each country to exactly one pricing market
export const marketCountries = cloudSchema.table(
  'market_countries',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    marketId: uuid('market_id')
      .notNull()
      .references(() => markets.id, { onDelete: 'cascade' }),
    countryId: uuid('country_id')
      .notNull()
      .references(() => countries.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).$onUpdate(() => new Date()),
  },
  (table) => [uniqueIndex('market_country_country_idx').on(table.countryId)],
);

export type MarketCountry = typeof marketCountries.$inferSelect;
export type NewMarketCountry = typeof marketCountries.$inferInsert;
