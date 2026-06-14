import { Injectable } from '@nestjs/common';
import { PrimaryBaseRepository, PrimaryDatabaseService } from '@vritti/api-sdk';
import { and, eq } from '@vritti/api-sdk/drizzle-orm';
import type { MarketCountry } from '@/db/schema';
import { countries, marketCountries } from '@/db/schema';

export type MarketCountryRow = {
  id: string;
  countryId: string;
  code: string;
  name: string;
};

@Injectable()
export class MarketCountryRepository extends PrimaryBaseRepository<typeof marketCountries> {
  constructor(database: PrimaryDatabaseService) {
    super(database, marketCountries);
  }

  // Returns all countries mapped to a market, joined with country details
  async findByMarketId(marketId: string): Promise<MarketCountryRow[]> {
    return this.db
      .select({
        id: marketCountries.id,
        countryId: marketCountries.countryId,
        code: countries.code,
        name: countries.name,
      })
      .from(marketCountries)
      .innerJoin(countries, eq(countries.id, marketCountries.countryId))
      .where(eq(marketCountries.marketId, marketId));
  }

  // Finds the market-country mapping for a country, if any
  async findByCountryId(countryId: string): Promise<MarketCountry | undefined> {
    return this.model.findFirst({ where: { countryId } });
  }

  // Finds a market-country mapping by market and country
  async findByMarketAndCountry(marketId: string, countryId: string): Promise<MarketCountry | undefined> {
    return this.model.findFirst({ where: { marketId, countryId } });
  }

  // Removes a market-country mapping by market and country
  async removeByMarketAndCountry(marketId: string, countryId: string): Promise<void> {
    await this.db
      .delete(marketCountries)
      .where(and(eq(marketCountries.marketId, marketId), eq(marketCountries.countryId, countryId)));
  }
}
