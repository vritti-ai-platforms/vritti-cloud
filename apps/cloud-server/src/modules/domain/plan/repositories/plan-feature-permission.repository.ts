import { Injectable } from '@nestjs/common';
import { PrimaryBaseRepository, PrimaryDatabaseService } from '@vritti/api-sdk';
import { and, eq, exists, inArray, or } from '@vritti/api-sdk/drizzle-orm';
import {
  appFeatures,
  apps,
  featurePermissions,
  features,
  permissionBusinesses,
  planApps,
  planFeaturePermissions,
} from '@/db/schema';

export interface AvailablePlanPermission {
  featurePermissionId: string;
  code: string;
  label: string;
}

export interface AvailablePlanFeature {
  id: string;
  code: string;
  name: string;
  icon: string;
  appCode: string;
  permissions: AvailablePlanPermission[];
}

@Injectable()
export class PlanFeaturePermissionRepository extends PrimaryBaseRepository<typeof planFeaturePermissions> {
  constructor(database: PrimaryDatabaseService) {
    super(database, planFeaturePermissions);
  }

  // Returns the unlocked feature-permission ids for a plan
  async findByPlanId(planId: string): Promise<string[]> {
    const rows = await this.db
      .select({ id: planFeaturePermissions.featurePermissionId })
      .from(planFeaturePermissions)
      .where(eq(planFeaturePermissions.planId, planId));
    return rows.map((r) => r.id);
  }

  // Replaces a plan's unlocked set with the given feature-permission ids
  async setUnlocked(planId: string, featurePermissionIds: string[]): Promise<void> {
    await this.database.drizzleClient.transaction(async (tx) => {
      await tx.delete(planFeaturePermissions).where(eq(planFeaturePermissions.planId, planId));
      if (featurePermissionIds.length > 0) {
        await tx.insert(planFeaturePermissions).values(featurePermissionIds.map((id) => ({ planId, featurePermissionId: id })));
      }
    });
  }

  // Returns the subset of the given feature-permission ids that actually exist
  async findExistingFeaturePermissionIds(ids: string[]): Promise<string[]> {
    if (ids.length === 0) return [];
    const rows = await this.db
      .select({ id: featurePermissions.id })
      .from(featurePermissions)
      .where(inArray(featurePermissions.id, ids));
    return rows.map((r) => r.id);
  }

  // Returns the features (+ business-scoped permissions) available to a plan via its apps — the unlock matrix source
  async findAvailableFeatures(
    planId: string,
    versionId: string,
    businessId: string,
  ): Promise<AvailablePlanFeature[]> {
    const rows = await this.db
      .select({
        featureId: features.id,
        featureCode: features.code,
        featureName: features.name,
        featureIcon: features.icon,
        featurePermissionId: featurePermissions.id,
        permissionCode: featurePermissions.code,
        permissionLabel: featurePermissions.label,
        appCode: apps.code,
      })
      .from(planApps)
      .innerJoin(
        apps,
        and(eq(apps.code, planApps.appCode), eq(apps.versionId, versionId), eq(apps.businessId, businessId)),
      )
      .innerJoin(appFeatures, eq(appFeatures.appId, apps.id))
      .innerJoin(features, eq(features.id, appFeatures.featureId))
      .innerJoin(featurePermissions, eq(featurePermissions.featureId, features.id))
      .where(
        and(
          eq(planApps.planId, planId),
          or(
            eq(featurePermissions.isGlobal, true),
            exists(
              this.database.drizzleClient
                .select({ id: permissionBusinesses.id })
                .from(permissionBusinesses)
                .where(
                  and(
                    eq(permissionBusinesses.featurePermissionId, featurePermissions.id),
                    eq(permissionBusinesses.businessId, businessId),
                  ),
                ),
            ),
          ),
        ),
      )
      .orderBy(features.sortOrder, featurePermissions.sortOrder);

    const map = new Map<string, AvailablePlanFeature>();
    for (const row of rows) {
      let feature = map.get(row.featureId);
      if (!feature) {
        feature = {
          id: row.featureId,
          code: row.featureCode,
          name: row.featureName,
          icon: row.featureIcon,
          appCode: row.appCode,
          permissions: [],
        };
        map.set(row.featureId, feature);
      }
      if (!feature.permissions.some((p) => p.featurePermissionId === row.featurePermissionId)) {
        feature.permissions.push({
          featurePermissionId: row.featurePermissionId,
          code: row.permissionCode,
          label: row.permissionLabel,
        });
      }
    }
    return Array.from(map.values());
  }
}
