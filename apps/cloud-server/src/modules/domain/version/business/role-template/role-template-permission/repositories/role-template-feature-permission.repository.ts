import { Injectable } from '@nestjs/common';
import { PrimaryBaseRepository, PrimaryDatabaseService, TypedDrizzleClient } from '@vritti/api-sdk';
import { and, eq, exists, inArray, or, sql } from '@vritti/api-sdk/drizzle-orm';
import type { NewRoleTemplateFeaturePermission } from '@/db/schema';
import {
  appFeatures,
  apps,
  featurePermissions,
  features,
  permissionBusinesses,
  roleTemplateApps,
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
  icon: string;
  permissions: AvailableFeaturePermission[];
  appCodes: string[];
  appIds: string[];
}

export interface RoleTemplateFeaturePermissionWithDetails {
  id: string;
  roleTemplateId: string;
  featurePermissionId: string;
  featureId: string;
  featureCode: string;
  featureName: string;
  code: string;
  label: string;
}

@Injectable()
export class RoleTemplateFeaturePermissionRepository extends PrimaryBaseRepository<
  typeof roleTemplateFeaturePermissions
> {
  constructor(database: PrimaryDatabaseService) {
    super(database, roleTemplateFeaturePermissions);
  }

  // Finds all grants for a role template, joining the permission and its feature
  async findByRoleTemplateId(roleTemplateId: string): Promise<RoleTemplateFeaturePermissionWithDetails[]> {
    const rows = await this.db
      .select({
        id: roleTemplateFeaturePermissions.id,
        roleTemplateId: roleTemplateFeaturePermissions.roleTemplateId,
        featurePermissionId: roleTemplateFeaturePermissions.featurePermissionId,
        featureId: featurePermissions.featureId,
        featureCode: features.code,
        featureName: features.name,
        code: featurePermissions.code,
        label: featurePermissions.label,
      })
      .from(roleTemplateFeaturePermissions)
      .innerJoin(featurePermissions, eq(roleTemplateFeaturePermissions.featurePermissionId, featurePermissions.id))
      .innerJoin(features, eq(featurePermissions.featureId, features.id))
      .where(eq(roleTemplateFeaturePermissions.roleTemplateId, roleTemplateId));

    return rows;
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

  // Counts the number of grants for a given role template
  async countByRoleTemplateId(roleTemplateId: string): Promise<number> {
    const result = await this.db
      .select({ count: sql<number>`count(*)` })
      .from(roleTemplateFeaturePermissions)
      .where(eq(roleTemplateFeaturePermissions.roleTemplateId, roleTemplateId));
    return Number(result[0]?.count ?? 0);
  }

  // Returns features from apps linked to a role template, with the business-scoped permissions, app codes, and app IDs.
  // Permissions are limited to global ones plus those explicitly granted to the given business.
  async findAvailableFeatures(roleTemplateId: string, businessId: string): Promise<AvailableFeature[]> {
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
        appId: apps.id,
      })
      .from(roleTemplateApps)
      .innerJoin(apps, eq(apps.id, roleTemplateApps.appId))
      .innerJoin(appFeatures, eq(appFeatures.appId, apps.id))
      .innerJoin(features, eq(features.id, appFeatures.featureId))
      .innerJoin(featurePermissions, eq(featurePermissions.featureId, features.id))
      .where(
        and(
          eq(roleTemplateApps.roleTemplateId, roleTemplateId),
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

    const map = new Map<string, AvailableFeature>();
    for (const row of rows) {
      let feature = map.get(row.featureId);
      if (!feature) {
        feature = {
          id: row.featureId,
          code: row.featureCode,
          name: row.featureName,
          icon: row.featureIcon,
          permissions: [],
          appCodes: [],
          appIds: [],
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
      if (!feature.appCodes.includes(row.appCode)) feature.appCodes.push(row.appCode);
      if (!feature.appIds.includes(row.appId)) feature.appIds.push(row.appId);
    }
    return Array.from(map.values());
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
