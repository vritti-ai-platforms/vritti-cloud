import { Injectable } from '@nestjs/common';
import { PrimaryBaseRepository, PrimaryDatabaseService } from '@vritti/api-sdk';
import { and, asc, eq } from '@vritti/api-sdk/drizzle-orm';
import type { AppPrice, BillingPeriod } from '@/db/schema';
import { appPrices, markets } from '@/db/schema';

export type AppPriceWithMarket = AppPrice & { marketName: string; marketCode: string; currencyCode: string };

@Injectable()
export class AppPriceRepository extends PrimaryBaseRepository<typeof appPrices> {
  constructor(database: PrimaryDatabaseService) {
    super(database, appPrices);
  }

  // Lists all prices for an app joined with market name and currency
  async findByAppWithMarket(appId: string): Promise<AppPriceWithMarket[]> {
    const rows = await this.db
      .select({
        id: appPrices.id,
        appId: appPrices.appId,
        marketId: appPrices.marketId,
        billingPeriod: appPrices.billingPeriod,
        amount: appPrices.amount,
        createdAt: appPrices.createdAt,
        updatedAt: appPrices.updatedAt,
        marketName: markets.name,
        marketCode: markets.code,
        currencyCode: markets.currencyCode,
      })
      .from(appPrices)
      .innerJoin(markets, eq(markets.id, appPrices.marketId))
      .where(eq(appPrices.appId, appId))
      .orderBy(asc(markets.name), asc(appPrices.billingPeriod));
    return rows as AppPriceWithMarket[];
  }

  // Finds a price by its unique identifier
  async findById(id: string): Promise<AppPrice | undefined> {
    return this.model.findFirst({ where: { id } });
  }

  // Finds a price matching the exact app + market + billing period combination
  async findByComposite(appId: string, marketId: string, billingPeriod: BillingPeriod): Promise<AppPrice | undefined> {
    return this.model.findFirst({ where: { appId, marketId, billingPeriod } });
  }

  // Updates the amount on an existing app price row
  async updateAmount(id: string, amount: number): Promise<AppPrice> {
    const result = await this.db.update(appPrices).set({ amount }).where(eq(appPrices.id, id)).returning();
    return result[0] as AppPrice;
  }

  // Deletes an app price by app + market + billing period
  async removeByComposite(appId: string, marketId: string, billingPeriod: BillingPeriod): Promise<void> {
    await this.db
      .delete(appPrices)
      .where(
        and(eq(appPrices.appId, appId), eq(appPrices.marketId, marketId), eq(appPrices.billingPeriod, billingPeriod)),
      );
  }

  // Returns addon prices for a specific market and billing period, with the market currency
  async findByMarketAndPeriod(
    marketId: string,
    billingPeriod: BillingPeriod,
  ): Promise<Array<{ appId: string; amount: number; currencyCode: string }>> {
    return this.db
      .select({ appId: appPrices.appId, amount: appPrices.amount, currencyCode: markets.currencyCode })
      .from(appPrices)
      .innerJoin(markets, eq(markets.id, appPrices.marketId))
      .where(and(eq(appPrices.marketId, marketId), eq(appPrices.billingPeriod, billingPeriod)));
  }
}
