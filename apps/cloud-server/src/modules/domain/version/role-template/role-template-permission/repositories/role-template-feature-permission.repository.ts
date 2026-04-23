import { Injectable } from '@nestjs/common';
import { PrimaryBaseRepository, PrimaryDatabaseService, TypedDrizzleClient } from '@vritti/api-sdk';
import { and, eq, sql } from '@vritti/api-sdk/drizzle-orm';
import type { FeatureType, NewRoleTemplateFeaturePermission } from '@/db/schema';
import {
  appFeatures,
  apps,
  featurePermissions,
  features,
  roleTemplateApps,
  roleTemplateFeaturePermissions,
} from '@/db/schema';

export interface RoleTemplateFeaturePermissionWithDetails {
  id: string;
  roleTemplateId: string;
  featureId: string;
  featureCode: string;
  featureName: string;
  type: FeatureType;
}

@Injectable()
export class RoleTemplateFeaturePermissionRepository extends PrimaryBaseRepository<
  typeof roleTemplateFeaturePermissions
> {
  constructor(database: PrimaryDatabaseService) {
    super(database, roleTemplateFeaturePermissions);
  }

  // Finds all role-template-feature-permissions for a role template, joining feature details
  async findByRoleTemplateId(roleTemplateId: string): Promise<RoleTemplateFeaturePermissionWithDetails[]> {
    const rows = await this.db
      .select({
        id: roleTemplateFeaturePermissions.id,
        roleTemplateId: roleTemplateFeaturePermissions.roleTemplateId,
        featureId: roleTemplateFeaturePermissions.featureId,
        featureCode: features.code,
        featureName: features.name,
        type: roleTemplateFeaturePermissions.type,
      })
      .from(roleTemplateFeaturePermissions)
      .innerJoin(features, eq(roleTemplateFeaturePermissions.featureId, features.id))
      .where(eq(roleTemplateFeaturePermissions.roleTemplateId, roleTemplateId));

    return rows;
  }

  // Deletes all role-template-feature-permission entries for a given role template
  async deleteByRoleTemplateId(roleTemplateId: string, tx?: TypedDrizzleClient): Promise<void> {
    const db = tx ?? this.db;
    await db
      .delete(roleTemplateFeaturePermissions)
      .where(eq(roleTemplateFeaturePermissions.roleTemplateId, roleTemplateId));
  }

  // Bulk-inserts role-template-feature-permission entries
  async bulkCreate(entries: NewRoleTemplateFeaturePermission[], tx?: TypedDrizzleClient): Promise<void> {
    if (entries.length === 0) return;
    const db = tx ?? this.db;
    await db.insert(roleTemplateFeaturePermissions).values(entries);
  }

  // Counts the number of permissions for a given role template
  async countByRoleTemplateId(roleTemplateId: string): Promise<number> {
    const result = await this.db
      .select({ count: sql<number>`count(*)` })
      .from(roleTemplateFeaturePermissions)
      .where(eq(roleTemplateFeaturePermissions.roleTemplateId, roleTemplateId));
    return Number(result[0]?.count ?? 0);
  }

  // Counts permissions for a role template that belong to features of a specific app
  async countByAppForRoleTemplate(roleTemplateId: string, appId: string): Promise<number> {
    const result = await this.db
      .select({ count: sql<number>`count(*)` })
      .from(roleTemplateFeaturePermissions)
      .innerJoin(
        appFeatures,
        and(eq(appFeatures.featureId, roleTemplateFeaturePermissions.featureId), eq(appFeatures.appId, appId)),
      )
      .where(eq(roleTemplateFeaturePermissions.roleTemplateId, roleTemplateId));
    return Number(result[0]?.count ?? 0);
  }

  // Returns features from apps linked to a role template, with their permissions, app codes, and app IDs
  async findAvailableFeatures(roleTemplateId: string): Promise<
    Array<{
      id: string;
      code: string;
      name: string;
      icon: string;
      permissions: string[];
      appCodes: string[];
      appIds: string[];
    }>
  > {
    const rows = await this.db
      .select({
        id: features.id,
        code: features.code,
        name: features.name,
        icon: features.icon,
        permissions: sql<string[]>`array_agg(distinct ${featurePermissions.type})`.mapWith({
          mapFromDriverValue: (value: unknown) =>
            Array.isArray(value) ? value : String(value).slice(1, -1).split(','),
        }),
        appCodes: sql<string[]>`array_agg(distinct ${apps.code})`.mapWith({
          mapFromDriverValue: (value: unknown) =>
            Array.isArray(value) ? value : String(value).slice(1, -1).split(','),
        }),
        appIds: sql<string[]>`array_agg(distinct ${apps.id})`,
      })
      .from(roleTemplateApps)
      .innerJoin(apps, eq(apps.id, roleTemplateApps.appId))
      .innerJoin(appFeatures, eq(appFeatures.appId, apps.id))
      .innerJoin(features, eq(features.id, appFeatures.featureId))
      .innerJoin(featurePermissions, eq(featurePermissions.featureId, features.id))
      .where(eq(roleTemplateApps.roleTemplateId, roleTemplateId))
      .groupBy(features.id)
      .orderBy(features.sortOrder);
    return rows as Array<{
      id: string;
      code: string;
      name: string;
      icon: string;
      permissions: string[];
      appCodes: string[];
      appIds: string[];
    }>;
  }
}
