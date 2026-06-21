import { Injectable } from '@nestjs/common';
import { PrimaryBaseRepository, PrimaryDatabaseService } from '@vritti/api-sdk';
import { and, eq, exists, inArray, or } from '@vritti/api-sdk/drizzle-orm';
import {
  appFeatures,
  apps,
  featurePermissions,
  features,
  permissionBusinesses,
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
  permissions: AvailablePlanPermission[];
}

// An app (layer 1 of the unlock matrix) with the features it owns (layer 2)
export interface AvailablePlanApp {
  id: string;
  code: string;
  name: string;
  icon: string;
  features: AvailablePlanFeature[];
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
        await tx
          .insert(planFeaturePermissions)
          .values(featurePermissionIds.map((id) => ({ planId, featurePermissionId: id })));
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

  // Returns the business's apps (each with the features it owns + business-scoped permissions) — the unlock matrix source.
  // The plan no longer scopes apps; the plan can unlock any of the business's feature-permissions.
  async findAvailableApps(versionId: string, businessId: string): Promise<AvailablePlanApp[]> {
    const rows = await this.db
      .select({
        appId: apps.id,
        appCode: apps.code,
        appName: apps.name,
        appIcon: apps.icon,
        featureId: features.id,
        featureCode: features.code,
        featureName: features.name,
        featureIcon: features.icon,
        featurePermissionId: featurePermissions.id,
        permissionCode: featurePermissions.code,
        permissionLabel: featurePermissions.label,
      })
      .from(appFeatures)
      .innerJoin(apps, and(eq(apps.id, appFeatures.appId), eq(apps.businessId, businessId)))
      .innerJoin(features, eq(features.id, appFeatures.featureId))
      .innerJoin(featurePermissions, eq(featurePermissions.featureId, features.id))
      .where(
        and(
          eq(appFeatures.versionId, versionId),
          eq(appFeatures.businessId, businessId),
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
      .orderBy(apps.sortOrder, features.sortOrder, featurePermissions.sortOrder);

    const appMap = new Map<string, AvailablePlanApp>();
    const featureMap = new Map<string, AvailablePlanFeature>();
    for (const row of rows) {
      let app = appMap.get(row.appId);
      if (!app) {
        app = { id: row.appId, code: row.appCode, name: row.appName, icon: row.appIcon, features: [] };
        appMap.set(row.appId, app);
      }
      const featureKey = `${row.appId}:${row.featureId}`;
      let feature = featureMap.get(featureKey);
      if (!feature) {
        feature = {
          id: row.featureId,
          code: row.featureCode,
          name: row.featureName,
          icon: row.featureIcon,
          permissions: [],
        };
        featureMap.set(featureKey, feature);
        app.features.push(feature);
      }
      if (!feature.permissions.some((p) => p.featurePermissionId === row.featurePermissionId)) {
        feature.permissions.push({
          featurePermissionId: row.featurePermissionId,
          code: row.permissionCode,
          label: row.permissionLabel,
        });
      }
    }
    return Array.from(appMap.values());
  }
}
