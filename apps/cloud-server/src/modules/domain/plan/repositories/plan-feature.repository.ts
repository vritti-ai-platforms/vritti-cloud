import { Injectable } from '@nestjs/common';
import { PrimaryBaseRepository, PrimaryDatabaseService } from '@vritti/api-sdk';
import { eq, sql } from '@vritti/api-sdk/drizzle-orm';
import type { AppPlatform, NewPlanFeature } from '@/db/schema';
import { planFeaturePermissions, planFeatures } from '@/db/schema';

// A plan's per-platform feature membership with the action permissions unlocked under it
export interface PlanMembership {
  featureId: string;
  platform: AppPlatform;
  permissions: string[];
}

@Injectable()
export class PlanFeatureRepository extends PrimaryBaseRepository<typeof planFeatures> {
  constructor(database: PrimaryDatabaseService) {
    super(database, planFeatures);
  }

  // Returns the plan's memberships (feature, platform) with their unlocked permission ids aggregated per membership.
  // The empty array for a member with no unlocks (LEFT JOIN miss) is preserved via FILTER + COALESCE — included/view-only.
  async findByPlanId(planId: string): Promise<PlanMembership[]> {
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

  // Deletes all memberships for a plan (cascades its unlock grants)
  async deleteByPlanId(planId: string): Promise<void> {
    await this.db.delete(planFeatures).where(eq(planFeatures.planId, planId));
  }

  // Bulk-inserts memberships, returning each inserted row so the caller can map unlock grants onto them
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
