import { Injectable } from '@nestjs/common';
import { PrimaryBaseRepository, PrimaryDatabaseService } from '@vritti/api-sdk';
import { and, asc, eq } from '@vritti/api-sdk/drizzle-orm';
import type { AppPrice, BillingPeriod } from '@/db/schema';
import { appPrices, countries } from '@/db/schema';

export type AppPriceWithCountry = AppPrice & { countryName: string; countryCode: string; currencyCode: string };

@Injectable()
export class AppPriceRepository extends PrimaryBaseRepository<typeof appPrices> {
  constructor(database: PrimaryDatabaseService) {
    super(database, appPrices);
  }

  // Lists all prices for an app joined with country name and its default currency
  async findByAppWithCountry(appId: string): Promise<AppPriceWithCountry[]> {
    const rows = await this.db
      .select({
        id: appPrices.id,
        appId: appPrices.appId,
        countryId: appPrices.countryId,
        billingPeriod: appPrices.billingPeriod,
        amount: appPrices.amount,
        createdAt: appPrices.createdAt,
        updatedAt: appPrices.updatedAt,
        countryName: countries.name,
        countryCode: countries.code,
        currencyCode: countries.defaultCurrency,
      })
      .from(appPrices)
      .innerJoin(countries, eq(countries.id, appPrices.countryId))
      .where(eq(appPrices.appId, appId))
      .orderBy(asc(countries.name), asc(appPrices.billingPeriod));
    return rows as AppPriceWithCountry[];
  }

  // Finds a price by its unique identifier
  async findById(id: string): Promise<AppPrice | undefined> {
    return this.model.findFirst({ where: { id } });
  }

  // Finds a price matching the exact app + country + billing period combination
  async findByComposite(appId: string, countryId: string, billingPeriod: BillingPeriod): Promise<AppPrice | undefined> {
    return this.model.findFirst({ where: { appId, countryId, billingPeriod } });
  }

  // Updates the amount on an existing app price row
  async updateAmount(id: string, amount: number): Promise<AppPrice> {
    const result = await this.db.update(appPrices).set({ amount }).where(eq(appPrices.id, id)).returning();
    return result[0] as AppPrice;
  }

  // Deletes an app price by app + country + billing period
  async removeByComposite(appId: string, countryId: string, billingPeriod: BillingPeriod): Promise<void> {
    await this.db
      .delete(appPrices)
      .where(
        and(eq(appPrices.appId, appId), eq(appPrices.countryId, countryId), eq(appPrices.billingPeriod, billingPeriod)),
      );
  }

  // Returns addon prices for a specific country and billing period, with the country's default currency
  async findByCountryAndPeriod(
    countryId: string,
    billingPeriod: BillingPeriod,
  ): Promise<Array<{ appId: string; amount: number; currencyCode: string }>> {
    return this.db
      .select({ appId: appPrices.appId, amount: appPrices.amount, currencyCode: countries.defaultCurrency })
      .from(appPrices)
      .innerJoin(countries, eq(countries.id, appPrices.countryId))
      .where(and(eq(appPrices.countryId, countryId), eq(appPrices.billingPeriod, billingPeriod)));
  }
}
