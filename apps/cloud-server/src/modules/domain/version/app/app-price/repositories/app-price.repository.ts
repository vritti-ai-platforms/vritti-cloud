import { Injectable } from '@nestjs/common';
import { PrimaryBaseRepository, PrimaryDatabaseService } from '@vritti/api-sdk';
import { and, eq } from '@vritti/api-sdk/drizzle-orm';
import type { AppPrice } from '@/db/schema';
import { appPrices, cloudProviders, regions } from '@/db/schema';

@Injectable()
export class AppPriceRepository extends PrimaryBaseRepository<typeof appPrices> {
  constructor(database: PrimaryDatabaseService) {
    super(database, appPrices);
  }

  // Lists all prices for an app with region and provider names
  async findByAppWithNames(
    appId: string,
  ): Promise<Array<AppPrice & { regionName: string; providerName: string }>> {
    const rows = await this.db
      .select({
        id: appPrices.id,
        appId: appPrices.appId,
        regionId: appPrices.regionId,
        cloudProviderId: appPrices.cloudProviderId,
        monthlyPrice: appPrices.monthlyPrice,
        currency: appPrices.currency,
        createdAt: appPrices.createdAt,
        updatedAt: appPrices.updatedAt,
        regionName: regions.name,
        providerName: cloudProviders.name,
      })
      .from(appPrices)
      .innerJoin(regions, eq(regions.id, appPrices.regionId))
      .innerJoin(cloudProviders, eq(cloudProviders.id, appPrices.cloudProviderId))
      .where(eq(appPrices.appId, appId));
    return rows as Array<AppPrice & { regionName: string; providerName: string }>;
  }

  // Finds a price by its unique identifier
  async findById(id: string): Promise<AppPrice | undefined> {
    return this.model.findFirst({ where: { id } });
  }

  // Checks if a price already exists for the given app + region + provider combination
  async findByUniqueKey(appId: string, regionId: string, cloudProviderId: string): Promise<AppPrice | undefined> {
    const [row] = await this.db
      .select()
      .from(appPrices)
      .where(
        and(
          eq(appPrices.appId, appId),
          eq(appPrices.regionId, regionId),
          eq(appPrices.cloudProviderId, cloudProviderId),
        ),
      )
      .limit(1);
    return row;
  }

  // Returns addon prices for a specific region and cloud provider
  async findByRegionAndProvider(
    regionId: string,
    cloudProviderId: string,
  ): Promise<Array<{ appId: string; monthlyPrice: string; currency: string }>> {
    return this.db
      .select({
        appId: appPrices.appId,
        monthlyPrice: appPrices.monthlyPrice,
        currency: appPrices.currency,
      })
      .from(appPrices)
      .where(and(eq(appPrices.regionId, regionId), eq(appPrices.cloudProviderId, cloudProviderId)));
  }
}
