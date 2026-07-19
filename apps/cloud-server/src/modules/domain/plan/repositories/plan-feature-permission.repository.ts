import { Injectable } from '@nestjs/common';
import { PrimaryBaseRepository, PrimaryDatabaseService } from '@vritti/api-sdk/database';
import { and, eq, exists, inArray, or } from '@vritti/api-sdk/drizzle-orm';
import type { AppPlatform, NewPlanFeaturePermission, ScopeType } from '@/db/schema';
import {
  businessAppFeatures,
  businessApps,
  featurePermissionDependencies,
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
  dependsOn: string[];
}

export interface AvailablePlanFeature {
  id: string;
  code: string;
  name: string;
  lucideIcon: string;
  scope: ScopeType;
  permissions: AvailablePlanPermission[];
  platforms: AppPlatform[];
}

export interface AvailablePlanApp {
  id: string;
  code: string;
  name: string;
  icon: string;
  features: AvailablePlanFeature[];
}

export interface PlanUnlockGrant {
  featurePermissionId: string;
  platform: AppPlatform;
}

@Injectable()
export class PlanFeaturePermissionDomainRepository extends PrimaryBaseRepository<typeof planFeaturePermissions> {
  constructor(database: PrimaryDatabaseService) {
    super(database, planFeaturePermissions);
  }

  // Returns the plan's platform-scoped unlock pairs (platform comes from the plan_feature row)
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

  // Bulk-inserts unlocked-permission entries (each carrying its plan_feature_id parent)
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
        appId: businessApps.id,
        appCode: businessApps.code,
        appName: businessApps.name,
        appIcon: businessApps.icon,
        featureId: features.id,
        featureCode: features.code,
        featureName: features.name,
        featureIcon: features.lucideIcon,
        featureScope: features.scope,
        featurePermissionId: featurePermissions.id,
        permissionCode: featurePermissions.code,
        permissionLabel: featurePermissions.label,
        webMfId: features.webMfId,
        mobileMfId: features.mobileMfId,
      })
      .from(businessAppFeatures)
      .innerJoin(
        businessApps,
        and(eq(businessApps.id, businessAppFeatures.appId), eq(businessApps.businessId, businessId)),
      )
      .innerJoin(features, eq(features.id, businessAppFeatures.featureId))
      .innerJoin(featurePermissions, eq(featurePermissions.featureId, features.id))
      .where(
        and(
          eq(businessAppFeatures.versionId, versionId),
          eq(businessAppFeatures.businessId, businessId),
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
      .orderBy(businessApps.name, features.sortOrder, featurePermissions.sortOrder);

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
          scope: row.featureScope,
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
          dependsOn: [],
        });
      }
    }

    // Attach each permission's prerequisite sibling codes so the matrix can auto-toggle
    const apps = Array.from(appMap.values());
    const featureIds = apps.flatMap((app) => app.features.map((f) => f.id));
    const depsByFeature = await this.findDependsOnCodesByFeatureIds(featureIds);
    for (const app of apps) {
      for (const feature of app.features) {
        const byCode = depsByFeature.get(feature.id);
        if (!byCode) continue;
        for (const perm of feature.permissions) perm.dependsOn = byCode.get(perm.code) ?? [];
      }
    }
    return apps;
  }

  // Returns featureId -> (permissionCode -> prerequisite sibling codes) for the given features
  async findDependsOnCodesByFeatureIds(featureIds: string[]): Promise<Map<string, Map<string, string[]>>> {
    const result = new Map<string, Map<string, string[]>>();
    const unique = [...new Set(featureIds)];
    if (unique.length === 0) return result;

    const perms = await this.db
      .select({ id: featurePermissions.id, featureId: featurePermissions.featureId, code: featurePermissions.code })
      .from(featurePermissions)
      .where(inArray(featurePermissions.featureId, unique));
    const permById = new Map(perms.map((p) => [p.id, p]));
    const permIds = perms.map((p) => p.id);

    for (const p of perms) {
      let byCode = result.get(p.featureId);
      if (!byCode) {
        byCode = new Map();
        result.set(p.featureId, byCode);
      }
      if (!byCode.has(p.code)) byCode.set(p.code, []);
    }

    const edges = permIds.length
      ? await this.db
          .select({
            permissionId: featurePermissionDependencies.permissionId,
            dependsOnId: featurePermissionDependencies.dependsOnId,
          })
          .from(featurePermissionDependencies)
          .where(inArray(featurePermissionDependencies.permissionId, permIds))
      : [];
    for (const edge of edges) {
      const dependent = permById.get(edge.permissionId);
      const prereq = permById.get(edge.dependsOnId);
      if (!dependent || !prereq || prereq.featureId !== dependent.featureId) continue;
      result.get(dependent.featureId)?.get(dependent.code)?.push(prereq.code);
    }
    return result;
  }

  // Returns id -> { featureId, code } for the given permission ids (dependency validation translation)
  async findPermissionCodesByIds(ids: string[]): Promise<Map<string, { featureId: string; code: string }>> {
    const result = new Map<string, { featureId: string; code: string }>();
    const unique = [...new Set(ids)];
    if (unique.length === 0) return result;
    const rows = await this.db
      .select({ id: featurePermissions.id, featureId: featurePermissions.featureId, code: featurePermissions.code })
      .from(featurePermissions)
      .where(inArray(featurePermissions.id, unique));
    for (const r of rows) result.set(r.id, { featureId: r.featureId, code: r.code });
    return result;
  }
}
