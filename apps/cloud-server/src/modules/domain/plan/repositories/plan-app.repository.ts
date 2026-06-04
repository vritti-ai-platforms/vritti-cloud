import { Injectable } from '@nestjs/common';
import { PrimaryBaseRepository, PrimaryDatabaseService } from '@vritti/api-sdk';
import { and, count, eq, type SQL } from '@vritti/api-sdk/drizzle-orm';
import type { PlanApp } from '@/db/schema';
import { planApps } from '@/db/schema';

export type PlanAppRow = {
  id: string;
  planId: string;
  appCode: string;
  includedFeatureCodes: string[] | null;
  sortOrder: number;
};

@Injectable()
export class PlanAppRepository extends PrimaryBaseRepository<typeof planApps> {
  constructor(database: PrimaryDatabaseService) {
    super(database, planApps);
  }

  // Returns all plan-app rows for a plan
  async findByPlanId(planId: string): Promise<PlanAppRow[]> {
    return this.db
      .select({
        id: planApps.id,
        planId: planApps.planId,
        appCode: planApps.appCode,
        includedFeatureCodes: planApps.includedFeatureCodes,
        sortOrder: planApps.sortOrder,
      })
      .from(planApps)
      .where(eq(planApps.planId, planId));
  }

  // Finds a plan-app row by planId and appCode
  async findByPlanAndAppCode(planId: string, appCode: string): Promise<PlanApp | undefined> {
    return this.model.findFirst({ where: { planId, appCode } });
  }

  // Updates included feature codes and sort order for a plan-app row
  async updateIncludedFeatureCodes(id: string, data: { includedFeatureCodes?: string[] | null; sortOrder?: number }): Promise<PlanApp> {
    const result = await this.db
      .update(planApps)
      .set(data)
      .where(eq(planApps.id, id))
      .returning();
    return result[0] as PlanApp;
  }

  // Deletes a plan-app row by planId and appCode
  async removeByPlanAndAppCode(planId: string, appCode: string): Promise<void> {
    await this.db.delete(planApps).where(and(eq(planApps.planId, planId), eq(planApps.appCode, appCode)));
  }

  // Returns paginated plan-app rows for the data table
  async findAllForTable(
    planId: string,
    where: SQL | undefined,
    orderBy: SQL[] | undefined,
    limit: number,
    offset: number,
  ): Promise<{
    rows: Array<{
      appCode: string;
      includedFeatureCodes: string[] | null;
      sortOrder: number;
    }>;
    total: number;
  }> {
    const baseWhere = where ? and(eq(planApps.planId, planId), where) : eq(planApps.planId, planId);

    const [rows, totalResult] = await Promise.all([
      this.db
        .select({
          appCode: planApps.appCode,
          includedFeatureCodes: planApps.includedFeatureCodes,
          sortOrder: planApps.sortOrder,
        })
        .from(planApps)
        .where(baseWhere)
        .orderBy(...(orderBy ?? []))
        .limit(limit)
        .offset(offset),
      this.db
        .select({ count: count() })
        .from(planApps)
        .where(baseWhere),
    ]);

    return { rows, total: Number(totalResult[0]?.count ?? 0) };
  }
}
