import { Injectable } from '@nestjs/common';
import { PrimaryBaseRepository, PrimaryDatabaseService } from '@vritti/api-sdk';
import { and, asc, count, eq } from '@vritti/api-sdk/drizzle-orm';
import type { BillingPeriod, PlanPrice } from '@/db/schema';
import { countries, planPrices, plans } from '@/db/schema';

export type PlanPriceWithCountry = PlanPrice & { countryName: string; countryCode: string; currencyCode: string };

@Injectable()
export class PlanPriceRepository extends PrimaryBaseRepository<typeof planPrices> {
  constructor(database: PrimaryDatabaseService) {
    super(database, planPrices);
  }

  // Finds a plan price by its unique identifier
  async findById(id: string): Promise<PlanPrice | undefined> {
    return this.model.findFirst({ where: { id } });
  }

  // Checks whether the parent plan exists
  async planExists(planId: string): Promise<boolean> {
    const rows = await this.db.select({ id: plans.id }).from(plans).where(eq(plans.id, planId)).limit(1);
    return rows.length > 0;
  }

  // Lists all prices for a plan joined with country name and its default currency
  async findByPlanWithCountry(planId: string): Promise<PlanPriceWithCountry[]> {
    const rows = await this.db
      .select({
        id: planPrices.id,
        planId: planPrices.planId,
        countryId: planPrices.countryId,
        billingPeriod: planPrices.billingPeriod,
        amount: planPrices.amount,
        createdAt: planPrices.createdAt,
        updatedAt: planPrices.updatedAt,
        countryName: countries.name,
        countryCode: countries.code,
        currencyCode: countries.defaultCurrency,
      })
      .from(planPrices)
      .innerJoin(countries, eq(countries.id, planPrices.countryId))
      .where(eq(planPrices.planId, planId))
      .orderBy(asc(countries.name), asc(planPrices.billingPeriod));
    return rows as PlanPriceWithCountry[];
  }

  // Finds a plan price matching the exact plan + country + billing period combination
  async findByComposite(
    planId: string,
    countryId: string,
    billingPeriod: BillingPeriod,
  ): Promise<PlanPrice | undefined> {
    return this.model.findFirst({ where: { planId, countryId, billingPeriod } });
  }

  // Updates the amount on an existing plan price row
  async updateAmount(id: string, amount: number): Promise<PlanPrice> {
    const result = await this.db.update(planPrices).set({ amount }).where(eq(planPrices.id, id)).returning();
    return result[0] as PlanPrice;
  }

  // Deletes a plan price by plan + country + billing period
  async removeByComposite(planId: string, countryId: string, billingPeriod: BillingPeriod): Promise<void> {
    await this.db
      .delete(planPrices)
      .where(
        and(
          eq(planPrices.planId, planId),
          eq(planPrices.countryId, countryId),
          eq(planPrices.billingPeriod, billingPeriod),
        ),
      );
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
}
