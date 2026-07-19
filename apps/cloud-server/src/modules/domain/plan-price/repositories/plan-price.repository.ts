import { Injectable } from '@nestjs/common';
import { PrimaryBaseRepository, PrimaryDatabaseService } from '@vritti/api-sdk/database';
import { asc, count, eq } from '@vritti/api-sdk/drizzle-orm';
import type { PlanPrice } from '@/db/schema';
import { billingCycles, countries, planPrices, plans } from '@/db/schema';

export type PlanPriceWithDetails = PlanPrice & {
  planName: string;
  countryName: string;
  countryCode: string;
  currencyCode: string;
  billingCycleName: string;
  billingCycleDays: number;
};

@Injectable()
export class PlanPriceDomainRepository extends PrimaryBaseRepository<typeof planPrices> {
  constructor(database: PrimaryDatabaseService) {
    super(database, planPrices);
  }

  // Finds a plan price by its unique identifier
  async findById(id: string): Promise<PlanPrice | undefined> {
    return this.model.findFirst({ where: { id } });
  }

  // Checks whether a plan exists by its unique identifier
  async planExists(planId: string): Promise<boolean> {
    const rows = await this.db.select({ id: plans.id }).from(plans).where(eq(plans.id, planId)).limit(1);
    return rows.length > 0;
  }

  // Lists all prices for a plan joined with plan, country, and billing cycle details
  async findByPlanWithDetails(planId: string): Promise<PlanPriceWithDetails[]> {
    const rows = await this.db
      .select({
        id: planPrices.id,
        planId: planPrices.planId,
        countryId: planPrices.countryId,
        billingCycleId: planPrices.billingCycleId,
        amount: planPrices.amount,
        createdAt: planPrices.createdAt,
        updatedAt: planPrices.updatedAt,
        planName: plans.name,
        countryName: countries.name,
        countryCode: countries.code,
        currencyCode: countries.defaultCurrency,
        billingCycleName: billingCycles.name,
        billingCycleDays: billingCycles.days,
      })
      .from(planPrices)
      .innerJoin(plans, eq(plans.id, planPrices.planId))
      .innerJoin(countries, eq(countries.id, planPrices.countryId))
      .innerJoin(billingCycles, eq(billingCycles.id, planPrices.billingCycleId))
      .where(eq(planPrices.planId, planId))
      .orderBy(asc(countries.name), asc(billingCycles.days));
    return rows as PlanPriceWithDetails[];
  }

  // Finds a plan price matching the exact plan + country + billing cycle combination
  async findByComposite(planId: string, countryId: string, billingCycleId: string): Promise<PlanPrice | undefined> {
    return this.model.findFirst({ where: { planId, countryId, billingCycleId } });
  }

  // Updates the amount on an existing plan price row
  async updateAmount(id: string, amount: bigint): Promise<PlanPrice> {
    const result = await this.db.update(planPrices).set({ amount }).where(eq(planPrices.id, id)).returning();
    return result[0] as PlanPrice;
  }

  // Deletes a plan price by its unique identifier
  async removeById(id: string): Promise<void> {
    await this.db.delete(planPrices).where(eq(planPrices.id, id));
  }

  // Returns the number of prices configured for a plan
  async countByPlanId(planId: string): Promise<number> {
    const result = await this.db.select({ count: count() }).from(planPrices).where(eq(planPrices.planId, planId));
    return Number(result[0]?.count ?? 0);
  }

  // Returns the number of prices referencing the given country
  async countByCountryId(countryId: string): Promise<number> {
    const result = await this.db.select({ count: count() }).from(planPrices).where(eq(planPrices.countryId, countryId));
    return Number(result[0]?.count ?? 0);
  }

  // Returns the number of prices referencing the given billing cycle
  async countByBillingCycleId(billingCycleId: string): Promise<number> {
    const result = await this.db
      .select({ count: count() })
      .from(planPrices)
      .where(eq(planPrices.billingCycleId, billingCycleId));
    return Number(result[0]?.count ?? 0);
  }
}
