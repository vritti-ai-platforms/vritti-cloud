import { Injectable } from '@nestjs/common';
import { PrimaryBaseRepository, PrimaryDatabaseService, type TypedDrizzleClient } from '@vritti/api-sdk';
import { eq } from '@vritti/api-sdk/drizzle-orm';
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

  // Returns the role's memberships (feature, platform) with their granted permission ids nested under each
  async findByRoleTemplateId(roleTemplateId: string): Promise<RoleTemplateMembership[]> {
    const rows = await this.db
      .select({
        id: roleTemplateFeatures.id,
        featureId: roleTemplateFeatures.featureId,
        platform: roleTemplateFeatures.platform,
        featurePermissionId: roleTemplateFeaturePermissions.featurePermissionId,
      })
      .from(roleTemplateFeatures)
      .leftJoin(
        roleTemplateFeaturePermissions,
        eq(roleTemplateFeaturePermissions.roleTemplateFeatureId, roleTemplateFeatures.id),
      )
      .where(eq(roleTemplateFeatures.roleTemplateId, roleTemplateId));

    const byId = new Map<string, RoleTemplateMembership>();
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

  // Deletes all memberships for a role template (cascades its grants)
  async deleteByRoleTemplateId(roleTemplateId: string, tx?: TypedDrizzleClient): Promise<void> {
    const db = tx ?? this.db;
    await db.delete(roleTemplateFeatures).where(eq(roleTemplateFeatures.roleTemplateId, roleTemplateId));
  }

  // Bulk-inserts memberships, returning each inserted row so the caller can map grants onto them
  async bulkCreate(
    entries: NewRoleTemplateFeature[],
    tx?: TypedDrizzleClient,
  ): Promise<Array<{ id: string; featureId: string; platform: AppPlatform }>> {
    if (entries.length === 0) return [];
    const db = tx ?? this.db;
    return db.insert(roleTemplateFeatures).values(entries).returning({
      id: roleTemplateFeatures.id,
      featureId: roleTemplateFeatures.featureId,
      platform: roleTemplateFeatures.platform,
    });
  }
}
