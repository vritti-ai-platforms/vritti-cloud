import { Injectable } from '@nestjs/common';
import { PrimaryBaseRepository, PrimaryDatabaseService } from '@vritti/api-sdk/database';
import { eq, sql } from '@vritti/api-sdk/drizzle-orm';
import type { AppPlatform, NewPlanFeature } from '@/db/schema';
import { planFeaturePermissions, planFeatures } from '@/db/schema';

export interface PlanUnlock {
  featureId: string;
  platform: AppPlatform;
  permissions: string[];
}

@Injectable()
export class PlanFeatureRepository extends PrimaryBaseRepository<typeof planFeatures> {
  constructor(database: PrimaryDatabaseService) {
    super(database, planFeatures);
  }

  // Returns the plan's unlocks (feature, platform) with their unlocked permission ids aggregated per unlock
  async findByPlanId(planId: string): Promise<PlanUnlock[]> {
    return this.db
      .select({
        featureId: planFeatures.featureId,
        platform: planFeatures.platform,
        permissions: sql<
          string[]
        >`coalesce(json_agg(${planFeaturePermissions.featurePermissionId}) filter (where ${planFeaturePermissions.featurePermissionId} is not null), '[]')`,
      })
      .from(planFeatures)
      .leftJoin(planFeaturePermissions, eq(planFeaturePermissions.planFeatureId, planFeatures.id))
      .where(eq(planFeatures.planId, planId))
      .groupBy(planFeatures.id)
      .orderBy(planFeatures.featureId, planFeatures.platform);
  }

  // Deletes all unlocks for a plan (cascades its unlocked permissions)
  async deleteByPlanId(planId: string): Promise<void> {
    await this.db.delete(planFeatures).where(eq(planFeatures.planId, planId));
  }

  // Bulk-inserts unlocks, returning each inserted row so the caller can map permission ids onto them
  async bulkCreate(
    entries: NewPlanFeature[],
  ): Promise<Array<{ id: string; featureId: string; platform: AppPlatform }>> {
    if (entries.length === 0) return [];
    return this.db.insert(planFeatures).values(entries).returning({
      id: planFeatures.id,
      featureId: planFeatures.featureId,
      platform: planFeatures.platform,
    });
  }
}
