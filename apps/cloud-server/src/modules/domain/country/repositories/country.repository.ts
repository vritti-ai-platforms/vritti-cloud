import { Injectable } from '@nestjs/common';
import { PrimaryBaseRepository, PrimaryDatabaseService } from '@vritti/api-sdk';
import { asc, count, eq, type SQL } from '@vritti/api-sdk/drizzle-orm';
import type { Country } from '@/db/schema';
import { appPrices, countries, planPrices } from '@/db/schema';

@Injectable()
export class CountryRepository extends PrimaryBaseRepository<typeof countries> {
  constructor(database: PrimaryDatabaseService) {
    super(database, countries);
  }

  // Returns all countries ordered by name ascending
  async findAll(): Promise<Country[]> {
    return this.model.findMany({ orderBy: { name: 'asc' } });
  }

  // Finds a country by its unique identifier
  async findById(id: string): Promise<Country | undefined> {
    return this.model.findFirst({ where: { id } });
  }

  // Finds a country by its unique code
  async findByCode(code: string): Promise<Country | undefined> {
    return this.model.findFirst({ where: { code } });
  }

  // Returns paginated countries with total count, filtered/sorted
  async findAllWithCount(options: {
    where?: SQL;
    orderBy?: SQL[];
    limit?: number;
    offset?: number;
  }): Promise<{ rows: Country[]; total: number }> {
    const { where, orderBy, limit = 20, offset = 0 } = options;
    const [countResult, rows] = await Promise.all([
      this.db
        .select({ total: count() })
        .from(countries)
        .where(where)
        .then((r) => r[0]?.total ?? 0),
      this.db
        .select()
        .from(countries)
        .where(where)
        .orderBy(...(orderBy && orderBy.length > 0 ? orderBy : [asc(countries.name)]))
        .limit(limit)
        .offset(offset),
    ]);
    return { rows, total: Number(countResult) };
  }

  // Counts plan + app prices referencing this country
  async countPriceReferences(countryId: string): Promise<number> {
    const [planRows, appRows] = await Promise.all([
      this.db.select({ total: count() }).from(planPrices).where(eq(planPrices.countryId, countryId)),
      this.db.select({ total: count() }).from(appPrices).where(eq(appPrices.countryId, countryId)),
    ]);
    return Number(planRows[0]?.total ?? 0) + Number(appRows[0]?.total ?? 0);
  }
}
