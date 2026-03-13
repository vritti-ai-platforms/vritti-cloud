import { Injectable } from '@nestjs/common';
import { PrimaryBaseRepository, PrimaryDatabaseService } from '@vritti/api-sdk';
import { asc, count, eq, type SQL } from '@vritti/api-sdk/drizzle-orm';
import type { Plan } from '@/db/schema';
import { deploymentIndustryPlans, organizations, plans, prices } from '@/db/schema';

export type PlanRow = Plan & { priceCount: number };

@Injectable()
export class PlanRepository extends PrimaryBaseRepository<typeof plans> {
  constructor(database: PrimaryDatabaseService) {
    super(database, plans);
  }

  // Finds a plan by its unique identifier
  async findById(id: string): Promise<Plan | undefined> {
    return this.model.findFirst({ where: { id } });
  }

  // Finds a plan by its unique code
  async findByCode(code: string): Promise<Plan | undefined> {
    return this.model.findFirst({ where: { code } });
  }

  // Returns deployment and organization reference counts for a given plan
  async getReferenceCountsWithoutPrices(planId: string): Promise<{ deploymentCount: number; orgCount: number }> {
    const [deploymentRows, orgRows] = await Promise.all([
      this.db
        .select({ n: count(deploymentIndustryPlans.planId) })
        .from(deploymentIndustryPlans)
        .where(eq(deploymentIndustryPlans.planId, planId)),
      this.db.select({ n: count(organizations.id) }).from(organizations).where(eq(organizations.planId, planId)),
    ]);
    return {
      deploymentCount: Number(deploymentRows[0]?.n ?? 0),
      orgCount: Number(orgRows[0]?.n ?? 0),
    };
  }

  // Returns paginated plans with price counts, applying filter/sort/pagination
  async findAllWithCounts(options: {
    where?: SQL;
    orderBy?: SQL[];
    limit?: number;
    offset?: number;
  }): Promise<{ rows: PlanRow[]; total: number }> {
    const { where, orderBy, limit = 20, offset = 0 } = options;
    const [countResult, rows] = await Promise.all([
      this.db
        .select({ total: count() })
        .from(plans)
        .leftJoin(prices, eq(prices.planId, plans.id))
        .groupBy(plans.id)
        .where(where)
        .then((r) => r.length),
      this.db
        .select({
          id: plans.id,
          name: plans.name,
          code: plans.code,
          content: plans.content,
          createdAt: plans.createdAt,
          updatedAt: plans.updatedAt,
          priceCount: count(prices.id),
        })
        .from(plans)
        .leftJoin(prices, eq(prices.planId, plans.id))
        .groupBy(plans.id)
        .where(where)
        .orderBy(...(orderBy && orderBy.length > 0 ? orderBy : [asc(plans.name)]))
        .limit(limit)
        .offset(offset),
    ]);
    return { rows: rows as PlanRow[], total: countResult };
  }
}
