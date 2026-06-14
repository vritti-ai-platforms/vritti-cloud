import { Injectable } from '@nestjs/common';
import { PrimaryBaseRepository, PrimaryDatabaseService } from '@vritti/api-sdk';
import { asc, count, countDistinct, eq, type SQL } from '@vritti/api-sdk/drizzle-orm';
import type { Plan } from '@/db/schema';
import { businesses, deploymentPlans, organizations, planPrices, plans } from '@/db/schema';

export type PlanRow = Plan & { priceCount: number; businessName: string; marketCount: number };

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

  // Returns price, deployment, and organization reference counts plus display meta for a given plan
  async getReferenceCounts(
    planId: string,
  ): Promise<{
    priceCount: number;
    deploymentCount: number;
    orgCount: number;
    businessName: string;
    marketCount: number;
  }> {
    const [priceRows, deploymentRows, orgRows, businessRows, marketRows] = await Promise.all([
      this.db
        .select({ n: count(planPrices.id) })
        .from(planPrices)
        .where(eq(planPrices.planId, planId)),
      this.db
        .select({ n: count(deploymentPlans.planId) })
        .from(deploymentPlans)
        .where(eq(deploymentPlans.planId, planId)),
      this.db
        .select({ n: count(organizations.id) })
        .from(organizations)
        .where(eq(organizations.planId, planId)),
      this.db
        .select({ name: businesses.name })
        .from(plans)
        .innerJoin(businesses, eq(businesses.id, plans.businessId))
        .where(eq(plans.id, planId)),
      this.db
        .select({ n: countDistinct(planPrices.marketId) })
        .from(planPrices)
        .where(eq(planPrices.planId, planId)),
    ]);
    return {
      priceCount: Number(priceRows[0]?.n ?? 0),
      deploymentCount: Number(deploymentRows[0]?.n ?? 0),
      orgCount: Number(orgRows[0]?.n ?? 0),
      businessName: businessRows[0]?.name ?? '',
      marketCount: Number(marketRows[0]?.n ?? 0),
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
        .where(where)
        .then((r) => r[0]?.total ?? 0),
      this.db
        .select({
          id: plans.id,
          businessId: plans.businessId,
          name: plans.name,
          code: plans.code,
          content: plans.content,
          maxBusinessUnits: plans.maxBusinessUnits,
          usdAnchor: plans.usdAnchor,
          createdAt: plans.createdAt,
          updatedAt: plans.updatedAt,
          businessName: businesses.name,
          priceCount: count(planPrices.id),
          marketCount: countDistinct(planPrices.marketId),
        })
        .from(plans)
        .innerJoin(businesses, eq(businesses.id, plans.businessId))
        .leftJoin(planPrices, eq(planPrices.planId, plans.id))
        .groupBy(plans.id, businesses.name)
        .where(where)
        .orderBy(...(orderBy && orderBy.length > 0 ? orderBy : [asc(plans.name)]))
        .limit(limit)
        .offset(offset),
    ]);
    return { rows: rows as PlanRow[], total: Number(countResult) };
  }
}
