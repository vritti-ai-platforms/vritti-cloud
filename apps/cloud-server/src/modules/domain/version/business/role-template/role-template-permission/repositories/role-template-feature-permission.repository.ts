import { Injectable } from '@nestjs/common';
import { PrimaryBaseRepository, PrimaryDatabaseService, TypedDrizzleClient } from '@vritti/api-sdk';
import { and, eq, exists, inArray, or, sql } from '@vritti/api-sdk/drizzle-orm';
import type { AppPlatform, NewRoleTemplateFeaturePermission } from '@/db/schema';
import {
  appFeatures,
  apps,
  featurePermissions,
  features,
  permissionBusinesses,
  roleTemplateFeaturePermissions,
} from '@/db/schema';

export interface AvailableFeaturePermission {
  featurePermissionId: string;
  code: string;
  label: string;
}

export interface AvailableFeature {
  id: string;
  code: string;
  name: string;
  lucideIcon: string;
  permissions: AvailableFeaturePermission[];
  // Platforms this feature has a route on — drives which Web/Mobile columns the matrix shows
  platforms: AppPlatform[];
}

// An app (layer 1 of the matrix) with the features it owns (layer 2)
export interface AvailableApp {
  id: string;
  code: string;
  name: string;
  icon: string;
  features: AvailableFeature[];
}

@Injectable()
export class RoleTemplateFeaturePermissionRepository extends PrimaryBaseRepository<
  typeof roleTemplateFeaturePermissions
> {
  constructor(database: PrimaryDatabaseService) {
    super(database, roleTemplateFeaturePermissions);
  }

  // Deletes all grants for a given role template
  async deleteByRoleTemplateId(roleTemplateId: string, tx?: TypedDrizzleClient): Promise<void> {
    const db = tx ?? this.db;
    await db
      .delete(roleTemplateFeaturePermissions)
      .where(eq(roleTemplateFeaturePermissions.roleTemplateId, roleTemplateId));
  }

  // Bulk-inserts grant entries
  async bulkCreate(entries: NewRoleTemplateFeaturePermission[], tx?: TypedDrizzleClient): Promise<void> {
    if (entries.length === 0) return;
    const db = tx ?? this.db;
    await db.insert(roleTemplateFeaturePermissions).values(entries);
  }

  // Deletes all grants whose permission belongs to a given feature, across all role templates
  async deleteByFeatureId(featureId: string): Promise<void> {
    await this.db
      .delete(roleTemplateFeaturePermissions)
      .where(
        inArray(
          roleTemplateFeaturePermissions.featurePermissionId,
          this.database.drizzleClient
            .select({ id: featurePermissions.id })
            .from(featurePermissions)
            .where(eq(featurePermissions.featureId, featureId)),
        ),
      );
  }

  // Counts the distinct permissions granted to a role template (ignores the per-platform fan-out)
  async countByRoleTemplateId(roleTemplateId: string): Promise<number> {
    const result = await this.db
      .select({ count: sql<number>`count(distinct ${roleTemplateFeaturePermissions.featurePermissionId})` })
      .from(roleTemplateFeaturePermissions)
      .where(eq(roleTemplateFeaturePermissions.roleTemplateId, roleTemplateId));
    return Number(result[0]?.count ?? 0);
  }

  // Returns the business's apps (each with its features + business-scoped permissions + platforms) — the matrix source.
  // A role can grant any of the business's feature-permissions; its apps are derived from what it grants.
  async findAvailableApps(versionId: string, businessId: string): Promise<AvailableApp[]> {
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

    const appMap = new Map<string, AvailableApp>();
    const featureMap = new Map<string, AvailableFeature>();
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

  // Returns the subset of the given feature-permission ids that actually exist
  async findExistingFeaturePermissionIds(ids: string[]): Promise<string[]> {
    if (ids.length === 0) return [];
    const rows = await this.db
      .select({ id: featurePermissions.id })
      .from(featurePermissions)
      .where(inArray(featurePermissions.id, ids));
    return rows.map((row) => row.id);
  }
}
