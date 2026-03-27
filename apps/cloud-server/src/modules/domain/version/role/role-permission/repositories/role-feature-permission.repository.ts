import { Injectable } from '@nestjs/common';
import { PrimaryBaseRepository, PrimaryDatabaseService } from '@vritti/api-sdk';
import { eq, sql } from '@vritti/api-sdk/drizzle-orm';
import { features, roleFeaturePermissions } from '@/db/schema';
import type { FeatureType, NewRoleFeaturePermission } from '@/db/schema';

export interface RoleFeaturePermissionWithDetails {
  id: string;
  roleId: string;
  featureId: string;
  featureCode: string;
  featureName: string;
  type: FeatureType;
}

@Injectable()
export class RoleFeaturePermissionRepository extends PrimaryBaseRepository<typeof roleFeaturePermissions> {
  constructor(database: PrimaryDatabaseService) {
    super(database, roleFeaturePermissions);
  }

  // Finds all role-feature-permissions for a role, joining feature details
  async findByRoleId(roleId: string): Promise<RoleFeaturePermissionWithDetails[]> {
    const rows = await this.db
      .select({
        id: roleFeaturePermissions.id,
        roleId: roleFeaturePermissions.roleId,
        featureId: roleFeaturePermissions.featureId,
        featureCode: features.code,
        featureName: features.name,
        type: roleFeaturePermissions.type,
      })
      .from(roleFeaturePermissions)
      .innerJoin(features, eq(roleFeaturePermissions.featureId, features.id))
      .where(eq(roleFeaturePermissions.roleId, roleId));

    return rows;
  }

  // Deletes all role-feature-permission entries for a given role
  async deleteByRoleId(roleId: string): Promise<void> {
    await this.db.delete(roleFeaturePermissions).where(eq(roleFeaturePermissions.roleId, roleId));
  }

  // Bulk-inserts role-feature-permission entries
  async bulkCreate(entries: NewRoleFeaturePermission[]): Promise<void> {
    if (entries.length === 0) return;
    await this.db.insert(roleFeaturePermissions).values(entries);
  }

  // Counts the number of permissions for a given role
  async countByRoleId(roleId: string): Promise<number> {
    const result = await this.db
      .select({ count: sql<number>`count(*)` })
      .from(roleFeaturePermissions)
      .where(eq(roleFeaturePermissions.roleId, roleId));
    return Number(result[0]?.count ?? 0);
  }
}
