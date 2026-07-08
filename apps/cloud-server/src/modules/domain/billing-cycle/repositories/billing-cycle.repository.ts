import { Injectable } from '@nestjs/common';
import { PrimaryBaseRepository, PrimaryDatabaseService } from '@vritti/api-sdk/database';
import { asc, count, type SQL } from '@vritti/api-sdk/drizzle-orm';
import type { BillingCycle } from '@/db/schema';
import { billingCycles } from '@/db/schema';

@Injectable()
export class BillingCycleRepository extends PrimaryBaseRepository<typeof billingCycles> {
  constructor(database: PrimaryDatabaseService) {
    super(database, billingCycles);
  }

  // Returns all billing cycles ordered by sort order then name ascending
  async findAll(): Promise<BillingCycle[]> {
    return this.model.findMany({ orderBy: { sortOrder: 'asc', name: 'asc' } });
  }

  // Returns paginated billing cycles filtered/sorted for the data table
  async findAllForTable(options: {
    where?: SQL;
    orderBy?: SQL[];
    limit?: number;
    offset?: number;
  }): Promise<{ rows: BillingCycle[]; total: number }> {
    const { where, orderBy, limit = 20, offset = 0 } = options;
    const [countResult, rows] = await Promise.all([
      this.db
        .select({ total: count() })
        .from(billingCycles)
        .where(where)
        .then((r) => r[0]?.total ?? 0),
      this.db
        .select()
        .from(billingCycles)
        .where(where)
        .orderBy(...(orderBy && orderBy.length > 0 ? orderBy : [asc(billingCycles.sortOrder), asc(billingCycles.name)]))
        .limit(limit)
        .offset(offset),
    ]);
    return { rows: rows as BillingCycle[], total: Number(countResult) };
  }

  // Finds a billing cycle by its unique identifier
  async findById(id: string): Promise<BillingCycle | undefined> {
    return this.model.findFirst({ where: { id } });
  }

  // Finds a billing cycle by its unique name
  async findByName(name: string): Promise<BillingCycle | undefined> {
    return this.model.findFirst({ where: { name } });
  }
}
