import { Injectable } from '@nestjs/common';
import { PrimaryBaseRepository, PrimaryDatabaseService } from '@vritti/api-sdk';
import { and, asc, count, eq } from '@vritti/api-sdk/drizzle-orm';
import type { BillingPeriod, PlanPrice } from '@/db/schema';
import { markets, planPrices } from '@/db/schema';

export type PlanPriceWithMarket = PlanPrice & { marketName: string; marketCode: string; currencyCode: string };

@Injectable()
export class PlanPriceRepository extends PrimaryBaseRepository<typeof planPrices> {
  constructor(database: PrimaryDatabaseService) {
    super(database, planPrices);
  }

  // Finds a plan price by its unique identifier
  async findById(id: string): Promise<PlanPrice | undefined> {
    return this.model.findFirst({ where: { id } });
  }

  // Lists all prices for a plan joined with market name and currency
  async findByPlanWithMarket(planId: string): Promise<PlanPriceWithMarket[]> {
    const rows = await this.db
      .select({
        id: planPrices.id,
        planId: planPrices.planId,
        marketId: planPrices.marketId,
        billingPeriod: planPrices.billingPeriod,
        amount: planPrices.amount,
        createdAt: planPrices.createdAt,
        updatedAt: planPrices.updatedAt,
        marketName: markets.name,
        marketCode: markets.code,
        currencyCode: markets.currencyCode,
      })
      .from(planPrices)
      .innerJoin(markets, eq(markets.id, planPrices.marketId))
      .where(eq(planPrices.planId, planId))
      .orderBy(asc(markets.name), asc(planPrices.billingPeriod));
    return rows as PlanPriceWithMarket[];
  }

  // Finds a plan price matching the exact plan + market + billing period combination
  async findByComposite(
    planId: string,
    marketId: string,
    billingPeriod: BillingPeriod,
  ): Promise<PlanPrice | undefined> {
    return this.model.findFirst({ where: { planId, marketId, billingPeriod } });
  }

  // Updates the amount on an existing plan price row
  async updateAmount(id: string, amount: number): Promise<PlanPrice> {
    const result = await this.db.update(planPrices).set({ amount }).where(eq(planPrices.id, id)).returning();
    return result[0] as PlanPrice;
  }

  // Deletes a plan price by plan + market + billing period
  async removeByComposite(planId: string, marketId: string, billingPeriod: BillingPeriod): Promise<void> {
    await this.db
      .delete(planPrices)
      .where(
        and(
          eq(planPrices.planId, planId),
          eq(planPrices.marketId, marketId),
          eq(planPrices.billingPeriod, billingPeriod),
        ),
      );
  }

  // Returns the number of prices configured for a plan
  async countByPlanId(planId: string): Promise<number> {
    const result = await this.db.select({ count: count() }).from(planPrices).where(eq(planPrices.planId, planId));
    return Number(result[0]?.count ?? 0);
  }

  // Returns the number of prices referencing the given market
  async countByMarketId(marketId: string): Promise<number> {
    const result = await this.db.select({ count: count() }).from(planPrices).where(eq(planPrices.marketId, marketId));
    return Number(result[0]?.count ?? 0);
  }
}
