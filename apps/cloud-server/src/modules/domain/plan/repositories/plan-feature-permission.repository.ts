import { Injectable } from '@nestjs/common';
import { PrimaryBaseRepository, PrimaryDatabaseService } from '@vritti/api-sdk';
import { and, eq, exists, inArray, or } from '@vritti/api-sdk/drizzle-orm';
import type { AppPlatform, NewPlanFeaturePermission } from '@/db/schema';
import {
  appFeatures,
  apps,
  featurePermissions,
  features,
  permissionBusinesses,
  planFeaturePermissions,
  planFeatures,
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
  lucideIcon: string;
  permissions: AvailablePlanPermission[];
  // Platforms this feature has a route on — drives which Web/Mobile columns the matrix shows
  platforms: AppPlatform[];
}

// An app (layer 1 of the unlock matrix) with the features it owns (layer 2)
export interface AvailablePlanApp {
  id: string;
  code: string;
  name: string;
  icon: string;
  features: AvailablePlanFeature[];
}

// A single platform-scoped unlock on a plan
export interface PlanUnlockGrant {
  featurePermissionId: string;
  platform: AppPlatform;
}

@Injectable()
export class PlanFeaturePermissionRepository extends PrimaryBaseRepository<typeof planFeaturePermissions> {
  constructor(database: PrimaryDatabaseService) {
    super(database, planFeaturePermissions);
  }

  // Returns the plan's platform-scoped unlock pairs (platform comes from the membership row)
  async findGrantsByPlanId(planId: string): Promise<PlanUnlockGrant[]> {
    return this.db
      .select({
        featurePermissionId: planFeaturePermissions.featurePermissionId,
        platform: planFeatures.platform,
      })
      .from(planFeaturePermissions)
      .innerJoin(planFeatures, eq(planFeatures.id, planFeaturePermissions.planFeatureId))
      .where(eq(planFeaturePermissions.planId, planId));
  }

  // Returns the distinct feature-permission ids a plan unlocks on ANY platform (for "is it purchased" checks)
  async findUnlockedFeaturePermissionIds(planId: string): Promise<string[]> {
    const rows = await this.db
      .selectDistinct({ id: planFeaturePermissions.featurePermissionId })
      .from(planFeaturePermissions)
      .where(eq(planFeaturePermissions.planId, planId));
    return rows.map((r) => r.id);
  }

  // Bulk-inserts unlock grant entries (each carrying its plan_feature_id membership parent)
  async bulkCreate(entries: NewPlanFeaturePermission[]): Promise<void> {
    if (entries.length === 0) return;
    await this.db.insert(planFeaturePermissions).values(entries);
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

  // Returns the business's apps (each with its features + business-scoped permissions + supported platforms) — the unlock matrix source.
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
        featureIcon: features.lucideIcon,
        featurePermissionId: featurePermissions.id,
        permissionCode: featurePermissions.code,
        permissionLabel: featurePermissions.label,
        webMfId: features.webMfId,
        mobileMfId: features.mobileMfId,
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
          lucideIcon: row.featureIcon,
          permissions: [],
          platforms: [],
        };
        if (row.webMfId) feature.platforms.push('WEB');
        if (row.mobileMfId) feature.platforms.push('MOBILE');
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
