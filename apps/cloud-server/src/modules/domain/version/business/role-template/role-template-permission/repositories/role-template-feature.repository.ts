import { Injectable } from '@nestjs/common';
import { PrimaryBaseRepository, PrimaryDatabaseService } from '@vritti/api-sdk';
import { eq, sql } from '@vritti/api-sdk/drizzle-orm';
import type { AppPlatform, NewRoleTemplateFeature } from '@/db/schema';
import { roleTemplateFeaturePermissions, roleTemplateFeatures } from '@/db/schema';

// A role template's per-platform feature membership with the action permissions granted under it
export interface RoleTemplateMembership {
  featureId: string;
  platform: AppPlatform;
  permissions: string[];
}

@Injectable()
export class RoleTemplateFeatureRepository extends PrimaryBaseRepository<typeof roleTemplateFeatures> {
  constructor(database: PrimaryDatabaseService) {
    super(database, roleTemplateFeatures);
  }

  // Returns the role's memberships (feature, platform) with their granted permission ids aggregated per membership.
  // The empty array for a member with no grants (LEFT JOIN miss) is preserved via FILTER + COALESCE — the view-only gate.
  async findByRoleTemplateId(roleTemplateId: string): Promise<RoleTemplateMembership[]> {
    return this.db
      .select({
        featureId: roleTemplateFeatures.featureId,
        platform: roleTemplateFeatures.platform,
        permissions: sql<
          string[]
        >`coalesce(json_agg(${roleTemplateFeaturePermissions.featurePermissionId}) filter (where ${roleTemplateFeaturePermissions.featurePermissionId} is not null), '[]')`,
      })
      .from(roleTemplateFeatures)
      .leftJoin(
        roleTemplateFeaturePermissions,
        eq(roleTemplateFeaturePermissions.roleTemplateFeatureId, roleTemplateFeatures.id),
      )
      .where(eq(roleTemplateFeatures.roleTemplateId, roleTemplateId))
      .groupBy(roleTemplateFeatures.id)
      .orderBy(roleTemplateFeatures.featureId, roleTemplateFeatures.platform);
  }

  // Deletes all memberships for a role template (cascades its grants)
  async deleteByRoleTemplateId(roleTemplateId: string): Promise<void> {
    await this.db.delete(roleTemplateFeatures).where(eq(roleTemplateFeatures.roleTemplateId, roleTemplateId));
  }

  // Bulk-inserts memberships, returning each inserted row so the caller can map grants onto them
  async bulkCreate(
    entries: NewRoleTemplateFeature[],
  ): Promise<Array<{ id: string; featureId: string; platform: AppPlatform }>> {
    if (entries.length === 0) return [];
    return this.db.insert(roleTemplateFeatures).values(entries).returning({
      id: roleTemplateFeatures.id,
      featureId: roleTemplateFeatures.featureId,
      platform: roleTemplateFeatures.platform,
    });
  }
}
