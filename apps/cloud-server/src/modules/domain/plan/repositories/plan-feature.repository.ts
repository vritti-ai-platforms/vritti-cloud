import { Injectable } from '@nestjs/common';
import { PrimaryBaseRepository, PrimaryDatabaseService, type TypedDrizzleClient } from '@vritti/api-sdk';
import { eq } from '@vritti/api-sdk/drizzle-orm';
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

  // Returns the plan's memberships (feature, platform) with their unlocked permission ids nested under each
  async findByPlanId(planId: string): Promise<PlanMembership[]> {
    const rows = await this.db
      .select({
        id: planFeatures.id,
        featureId: planFeatures.featureId,
        platform: planFeatures.platform,
        featurePermissionId: planFeaturePermissions.featurePermissionId,
      })
      .from(planFeatures)
      .leftJoin(planFeaturePermissions, eq(planFeaturePermissions.planFeatureId, planFeatures.id))
      .where(eq(planFeatures.planId, planId));

    const byId = new Map<string, PlanMembership>();
    for (const r of rows) {
      let m = byId.get(r.id);
      if (!m) {
        m = { featureId: r.featureId, platform: r.platform, permissions: [] };
        byId.set(r.id, m);
      }
      if (r.featurePermissionId) m.permissions.push(r.featurePermissionId);
    }
    return [...byId.values()];
  }

  // Deletes all memberships for a plan (cascades its unlock grants)
  async deleteByPlanId(planId: string, tx?: TypedDrizzleClient): Promise<void> {
    const db = tx ?? this.db;
    await db.delete(planFeatures).where(eq(planFeatures.planId, planId));
  }

  // Bulk-inserts memberships, returning each inserted row so the caller can map unlock grants onto them
  async bulkCreate(
    entries: NewPlanFeature[],
    tx?: TypedDrizzleClient,
  ): Promise<Array<{ id: string; featureId: string; platform: AppPlatform }>> {
    if (entries.length === 0) return [];
    const db = tx ?? this.db;
    return db.insert(planFeatures).values(entries).returning({
      id: planFeatures.id,
      featureId: planFeatures.featureId,
      platform: planFeatures.platform,
    });
  }
}
