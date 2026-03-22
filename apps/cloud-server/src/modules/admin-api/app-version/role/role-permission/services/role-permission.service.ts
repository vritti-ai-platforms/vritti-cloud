import { Injectable, Logger } from '@nestjs/common';
import { BadRequestException, NotFoundException } from '@vritti/api-sdk';
import { inArray } from '@vritti/api-sdk/drizzle-orm';
import type { FeatureType, NewRoleFeaturePermission } from '@/db/schema';
import { features } from '@/db/schema';
import { RoleRepository } from '../../root/repositories/role.repository';
import type { AssignRolePermissionsDto } from '../dto/request/assign-role-permissions.dto';
import {
  RoleFeaturePermissionRepository,
  type RoleFeaturePermissionWithDetails,
} from '../repositories/role-feature-permission.repository';

export interface GroupedPermission {
  featureCode: string;
  featureName: string;
  types: FeatureType[];
}

@Injectable()
export class RolePermissionService {
  private readonly logger = new Logger(RolePermissionService.name);

  constructor(
    private readonly roleRepository: RoleRepository,
    private readonly roleFeaturePermissionRepository: RoleFeaturePermissionRepository,
  ) {}

  // Returns permissions for a role grouped by feature
  async findByRole(roleId: string): Promise<GroupedPermission[]> {
    const role = await this.roleRepository.findById(roleId);
    if (!role) {
      throw new NotFoundException('Role not found.');
    }

    const rows = await this.roleFeaturePermissionRepository.findByRoleId(roleId);
    this.logger.log(`Fetched permissions for role: ${roleId} (${rows.length} entries)`);
    return this.groupByFeature(rows);
  }

  // Replaces all permissions for a role with the given set
  async setPermissions(roleId: string, dto: AssignRolePermissionsDto): Promise<{ success: true; message: string }> {
    const role = await this.roleRepository.findById(roleId);
    if (!role) {
      throw new NotFoundException('Role not found.');
    }

    // Validate all featureIds exist
    const allFeatureIds = [...new Set(dto.permissions.map((p) => p.featureId))];
    if (allFeatureIds.length > 0) {
      await this.validateFeaturesExist(allFeatureIds);
    }

    // Full replace: delete all existing, then bulk insert
    const entries: NewRoleFeaturePermission[] = dto.permissions.map((perm) => ({
      appVersionId: role.appVersionId,
      roleId,
      featureId: perm.featureId,
      type: perm.type,
    }));

    await this.roleFeaturePermissionRepository.deleteByRoleId(roleId);
    await this.roleFeaturePermissionRepository.bulkCreate(entries);

    this.logger.log(`Set ${entries.length} permissions for role: ${role.name} (${roleId})`);
    return { success: true, message: 'Role permissions updated successfully.' };
  }

  // Groups flat role-feature-permission rows by feature
  private groupByFeature(rows: RoleFeaturePermissionWithDetails[]): GroupedPermission[] {
    const map = new Map<string, GroupedPermission>();

    for (const row of rows) {
      let group = map.get(row.featureId);
      if (!group) {
        group = { featureCode: row.featureCode, featureName: row.featureName, types: [] };
        map.set(row.featureId, group);
      }
      group.types.push(row.type);
    }

    return Array.from(map.values());
  }

  // Validates that all provided featureIds exist in the features table
  private async validateFeaturesExist(featureIds: string[]): Promise<void> {
    const existingFeatures = await this.roleFeaturePermissionRepository['db']
      .select({ id: features.id })
      .from(features)
      .where(inArray(features.id, featureIds));

    const existingIds = new Set(existingFeatures.map((f) => f.id));
    const missingIds = featureIds.filter((id) => !existingIds.has(id));

    if (missingIds.length > 0) {
      throw new BadRequestException({
        label: 'Invalid Features',
        detail: `The following feature IDs do not exist: ${missingIds.join(', ')}`,
      });
    }
  }
}
