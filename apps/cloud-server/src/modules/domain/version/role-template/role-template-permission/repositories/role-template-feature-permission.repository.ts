import { Injectable } from '@nestjs/common';
import { PrimaryBaseRepository, PrimaryDatabaseService } from '@vritti/api-sdk';
import { eq, sql } from '@vritti/api-sdk/drizzle-orm';
import { features, roleTemplateFeaturePermissions } from '@/db/schema';
import type { FeatureType, NewRoleTemplateFeaturePermission } from '@/db/schema';

export interface RoleTemplateFeaturePermissionWithDetails {
  id: string;
  roleTemplateId: string;
  featureId: string;
  featureCode: string;
  featureName: string;
  type: FeatureType;
}

@Injectable()
export class RoleTemplateFeaturePermissionRepository extends PrimaryBaseRepository<typeof roleTemplateFeaturePermissions> {
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
  async deleteByRoleTemplateId(roleTemplateId: string): Promise<void> {
    await this.db.delete(roleTemplateFeaturePermissions).where(eq(roleTemplateFeaturePermissions.roleTemplateId, roleTemplateId));
  }

  // Bulk-inserts role-template-feature-permission entries
  async bulkCreate(entries: NewRoleTemplateFeaturePermission[]): Promise<void> {
    if (entries.length === 0) return;
    await this.db.insert(roleTemplateFeaturePermissions).values(entries);
  }

  // Counts the number of permissions for a given role template
  async countByRoleTemplateId(roleTemplateId: string): Promise<number> {
    const result = await this.db
      .select({ count: sql<number>`count(*)` })
      .from(roleTemplateFeaturePermissions)
      .where(eq(roleTemplateFeaturePermissions.roleTemplateId, roleTemplateId));
    return Number(result[0]?.count ?? 0);
  }
}
