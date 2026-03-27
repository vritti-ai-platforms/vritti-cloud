import { Injectable } from '@nestjs/common';
import { PrimaryBaseRepository, PrimaryDatabaseService } from '@vritti/api-sdk';
import { asc, count, countDistinct, eq, inArray, sql, type SQL } from '@vritti/api-sdk/drizzle-orm';
import type { App } from '@/db/schema';
import { appFeatures, apps, industries, planApps } from '@/db/schema';

@Injectable()
export class AppRepository extends PrimaryBaseRepository<typeof apps> {
  constructor(database: PrimaryDatabaseService) {
    super(database, apps);
  }

  // Finds an app by its unique identifier
  async findById(id: string): Promise<App | undefined> {
    return this.model.findFirst({ where: { id } });
  }

  // Finds an app by its unique code
  async findByCode(code: string): Promise<App | undefined> {
    return this.model.findFirst({ where: { code } });
  }

  // Returns paginated apps with feature/plan counts and the total filtered count
  async findAllWithCounts(
    where?: SQL,
    orderBy?: SQL[],
    limit?: number,
    offset?: number,
  ): Promise<{ rows: Array<App & { featureCount: number; planCount: number }>; total: number }> {
    const [countResult, rows] = await Promise.all([
      this.db
        .select({ total: count() })
        .from(apps)
        .where(where)
        .then((r) => r[0]?.total ?? 0),
      this.db
        .select({
          id: apps.id,
          versionId: apps.versionId,
          code: apps.code,
          name: apps.name,
          description: apps.description,
          icon: apps.icon,
          isActive: apps.isActive,
          sortOrder: apps.sortOrder,
          createdAt: apps.createdAt,
          updatedAt: apps.updatedAt,
          featureCount: countDistinct(appFeatures.id),
          planCount: countDistinct(planApps.id),
        })
        .from(apps)
        .leftJoin(appFeatures, eq(appFeatures.appId, apps.id))
        .leftJoin(planApps, eq(planApps.appCode, apps.code))
        .where(where)
        .groupBy(apps.id)
        .orderBy(...(orderBy && orderBy.length > 0 ? orderBy : [asc(apps.name)]))
        .limit(limit ?? 20)
        .offset(offset ?? 0),
    ]);
    return {
      rows: rows as Array<App & { featureCount: number; planCount: number }>,
      total: Number(countResult),
    };
  }

  // Returns a single app with feature/plan counts, or undefined if not found
  async findOneWithCounts(
    id: string,
  ): Promise<(App & { featureCount: number; planCount: number }) | undefined> {
    const [row] = await this.db
      .select({
        id: apps.id,
        versionId: apps.versionId,
        code: apps.code,
        name: apps.name,
        description: apps.description,
        icon: apps.icon,
        isActive: apps.isActive,
        sortOrder: apps.sortOrder,
        createdAt: apps.createdAt,
        updatedAt: apps.updatedAt,
        featureCount: countDistinct(appFeatures.id),
        planCount: countDistinct(planApps.id),
      })
      .from(apps)
      .leftJoin(appFeatures, eq(appFeatures.appId, apps.id))
      .leftJoin(planApps, eq(planApps.appCode, apps.code))
      .where(eq(apps.id, id))
      .groupBy(apps.id)
      .limit(1);
    return row as (App & { featureCount: number; planCount: number }) | undefined;
  }

  // Counts how many plan_apps reference a given app by its code
  async countPlanReferences(appCode: string): Promise<number> {
    const result = await this.db
      .select({ count: count() })
      .from(planApps)
      .where(eq(planApps.appCode, appCode));
    return Number(result[0]?.count ?? 0);
  }

  // Counts how many industries have this app code in their recommendedApps JSONB array
  async countIndustryReferences(appCode: string): Promise<number> {
    const result = await this.db
      .select({ count: count() })
      .from(industries)
      .where(sql`${industries.recommendedApps} @> ${JSON.stringify([appCode])}::jsonb`);
    return Number(result[0]?.count ?? 0);
  }

  // Returns all active apps ordered by sort order
  async findAllActive(): Promise<App[]> {
    return this.model.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    });
  }

  // Returns apps matching the given IDs
  async findByIds(appIds: string[]): Promise<App[]> {
    if (appIds.length === 0) return [];
    return this.db.select().from(apps).where(inArray(apps.id, appIds));
  }
}
