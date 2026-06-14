import { Injectable } from '@nestjs/common';
import { PrimaryBaseRepository, PrimaryDatabaseService } from '@vritti/api-sdk';
import { asc, count, countDistinct, eq, type SQL } from '@vritti/api-sdk/drizzle-orm';
import type { Market } from '@/db/schema';
import { appPrices, marketCountries, markets, organizations, planPrices } from '@/db/schema';

export type MarketRow = Market & { countryCount: number };

@Injectable()
export class MarketRepository extends PrimaryBaseRepository<typeof markets> {
  constructor(database: PrimaryDatabaseService) {
    super(database, markets);
  }

  // Returns all markets
  async findAll(): Promise<Market[]> {
    return this.model.findMany({ orderBy: { name: 'asc' } });
  }

  // Finds a market by its unique identifier
  async findById(id: string): Promise<Market | undefined> {
    return this.model.findFirst({ where: { id } });
  }

  // Finds a market by its unique code
  async findByCode(code: string): Promise<Market | undefined> {
    return this.model.findFirst({ where: { code } });
  }

  // Returns paginated markets with country counts, applying filter/sort/pagination
  async findAllWithCounts(options: {
    where?: SQL;
    orderBy?: SQL[];
    limit?: number;
    offset?: number;
  }): Promise<{ rows: MarketRow[]; total: number }> {
    const { where, orderBy, limit = 20, offset = 0 } = options;
    const [countResult, rows] = await Promise.all([
      this.db
        .select({ total: count() })
        .from(markets)
        .leftJoin(marketCountries, eq(marketCountries.marketId, markets.id))
        .groupBy(markets.id)
        .where(where)
        .then((r) => r.length),
      this.db
        .select({
          id: markets.id,
          code: markets.code,
          name: markets.name,
          currencyCode: markets.currencyCode,
          isActive: markets.isActive,
          createdAt: markets.createdAt,
          updatedAt: markets.updatedAt,
          countryCount: countDistinct(marketCountries.countryId),
        })
        .from(markets)
        .leftJoin(marketCountries, eq(marketCountries.marketId, markets.id))
        .groupBy(markets.id)
        .where(where)
        .orderBy(...(orderBy && orderBy.length > 0 ? orderBy : [asc(markets.name)]))
        .limit(limit)
        .offset(offset),
    ]);
    return { rows: rows as MarketRow[], total: countResult };
  }

  // Returns reference counts across plan prices, app prices, and organizations for a market
  async countReferences(marketId: string): Promise<{ planPrices: number; appPrices: number; organizations: number }> {
    const [planPriceRows, appPriceRows, orgRows] = await Promise.all([
      this.db.select({ n: count() }).from(planPrices).where(eq(planPrices.marketId, marketId)),
      this.db.select({ n: count() }).from(appPrices).where(eq(appPrices.marketId, marketId)),
      this.db.select({ n: count() }).from(organizations).where(eq(organizations.marketId, marketId)),
    ]);
    return {
      planPrices: Number(planPriceRows[0]?.n ?? 0),
      appPrices: Number(appPriceRows[0]?.n ?? 0),
      organizations: Number(orgRows[0]?.n ?? 0),
    };
  }
}
