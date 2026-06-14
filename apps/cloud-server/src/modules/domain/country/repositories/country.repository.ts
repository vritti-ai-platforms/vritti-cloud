import { Injectable } from '@nestjs/common';
import { PrimaryBaseRepository, PrimaryDatabaseService } from '@vritti/api-sdk';
import { asc, count, eq, type SQL } from '@vritti/api-sdk/drizzle-orm';
import type { Country } from '@/db/schema';
import { countries, marketCountries } from '@/db/schema';

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

  // Counts market assignments referencing this country
  async countMarketReferences(countryId: string): Promise<number> {
    const result = await this.db
      .select({ total: count() })
      .from(marketCountries)
      .where(eq(marketCountries.countryId, countryId));
    return Number(result[0]?.total ?? 0);
  }
}
