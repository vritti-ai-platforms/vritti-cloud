import { Injectable } from '@nestjs/common';
import { PrimaryBaseRepository, PrimaryDatabaseService } from '@vritti/api-sdk';
import { eq, sql } from '@vritti/api-sdk/drizzle-orm';
import type { AppPlatform, NewRoleTemplateFeature } from '@/db/schema';
import { roleTemplateFeaturePermissions, roleTemplateFeatures } from '@/db/schema';

export interface RoleTemplateGrant {
  featureId: string;
  platform: AppPlatform;
  permissions: string[];
}

@Injectable()
export class RoleTemplateFeatureRepository extends PrimaryBaseRepository<typeof roleTemplateFeatures> {
  constructor(database: PrimaryDatabaseService) {
    super(database, roleTemplateFeatures);
  }

  // Returns the role's grants (feature, platform) with granted permission ids aggregated per grant (empty array preserved on LEFT JOIN miss)
  async findByRoleTemplateId(roleTemplateId: string): Promise<RoleTemplateGrant[]> {
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

  // Deletes all grants for a role template (cascades its granted permissions)
  async deleteByRoleTemplateId(roleTemplateId: string): Promise<void> {
    await this.db.delete(roleTemplateFeatures).where(eq(roleTemplateFeatures.roleTemplateId, roleTemplateId));
  }

  // Bulk-inserts grants, returning each inserted row so the caller can map permission ids onto them
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
