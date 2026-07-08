import { Injectable } from '@nestjs/common';
import { PrimaryBaseRepository, PrimaryDatabaseService } from '@vritti/api-sdk/database';
import { and, asc, count, countDistinct, eq, inArray, type SQL } from '@vritti/api-sdk/drizzle-orm';
import type { App } from '@/db/schema';
import { businessAppFeatures, businessApps } from '@/db/schema';

@Injectable()
export class AppRepository extends PrimaryBaseRepository<typeof businessApps> {
  constructor(database: PrimaryDatabaseService) {
    super(database, businessApps);
  }

  // Finds an app by its unique identifier
  async findById(id: string): Promise<App | undefined> {
    return this.model.findFirst({ where: { id } });
  }

  // Finds an app by version + business + code (apps are per-business so code is only unique within a business)
  async findByVersionBusinessCode(versionId: string, businessId: string, code: string): Promise<App | undefined> {
    return this.model.findFirst({ where: { versionId, businessId, code } });
  }

  // Counts features pinned to an app — an app can't be deleted while it still groups features
  async countFeatures(appId: string): Promise<number> {
    const rows = await this.db
      .select({ count: count() })
      .from(businessAppFeatures)
      .where(eq(businessAppFeatures.appId, appId));
    return Number(rows[0]?.count ?? 0);
  }

  // Returns paginated apps with feature counts and the total filtered count
  async findAllWithCounts(
    where?: SQL,
    orderBy?: SQL[],
    limit?: number,
    offset?: number,
  ): Promise<{ rows: Array<App & { featureCount: number }>; total: number }> {
    const [countResult, rows] = await Promise.all([
      this.db
        .select({ total: count() })
        .from(businessApps)
        .where(where)
        .then((r) => r[0]?.total ?? 0),
      this.db
        .select({
          id: businessApps.id,
          versionId: businessApps.versionId,
          businessId: businessApps.businessId,
          code: businessApps.code,
          name: businessApps.name,
          description: businessApps.description,
          icon: businessApps.icon,
          sortOrder: businessApps.sortOrder,
          createdAt: businessApps.createdAt,
          updatedAt: businessApps.updatedAt,
          featureCount: countDistinct(businessAppFeatures.id),
        })
        .from(businessApps)
        .leftJoin(businessAppFeatures, eq(businessAppFeatures.appId, businessApps.id))
        .where(where)
        .groupBy(businessApps.id)
        .orderBy(...(orderBy && orderBy.length > 0 ? orderBy : [asc(businessApps.name)]))
        .limit(limit ?? 20)
        .offset(offset ?? 0),
    ]);
    return {
      rows: rows as Array<App & { featureCount: number }>,
      total: Number(countResult),
    };
  }

  // Returns a single app with feature count, or undefined if not found
  async findOneWithCounts(id: string): Promise<(App & { featureCount: number }) | undefined> {
    const [row] = await this.db
      .select({
        id: businessApps.id,
        versionId: businessApps.versionId,
        businessId: businessApps.businessId,
        code: businessApps.code,
        name: businessApps.name,
        description: businessApps.description,
        icon: businessApps.icon,
        sortOrder: businessApps.sortOrder,
        createdAt: businessApps.createdAt,
        updatedAt: businessApps.updatedAt,
        featureCount: countDistinct(businessAppFeatures.id),
      })
      .from(businessApps)
      .leftJoin(businessAppFeatures, eq(businessAppFeatures.appId, businessApps.id))
      .where(eq(businessApps.id, id))
      .groupBy(businessApps.id)
      .limit(1);
    return row as (App & { featureCount: number }) | undefined;
  }

  // Returns all apps for a given business ordered by sort order
  async findByBusiness(versionId: string, businessId: string): Promise<App[]> {
    return this.model.findMany({
      where: { versionId, businessId },
      orderBy: { sortOrder: 'asc' },
    });
  }

  // Returns all apps for a given version
  async findAllByVersionId(versionId: string): Promise<App[]> {
    return this.model.findMany({ where: { versionId } });
  }

  // Returns all apps for a given version and business
  async findAllByVersionAndBusiness(versionId: string, businessId: string): Promise<App[]> {
    return this.db
      .select()
      .from(businessApps)
      .where(and(eq(businessApps.versionId, versionId), eq(businessApps.businessId, businessId)));
  }

  // Returns apps matching the given IDs
  async findByIds(appIds: string[]): Promise<App[]> {
    if (appIds.length === 0) return [];
    return this.db.select().from(businessApps).where(inArray(businessApps.id, appIds));
  }
}
