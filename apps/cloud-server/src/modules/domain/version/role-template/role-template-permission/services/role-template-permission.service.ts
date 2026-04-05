import { Injectable, Logger } from '@nestjs/common';
import { BadRequestException, NotFoundException } from '@vritti/api-sdk';
import { inArray } from '@vritti/api-sdk/drizzle-orm';
import type { FeatureType, NewRoleTemplateFeaturePermission } from '@/db/schema';
import { features } from '@/db/schema';
import type { AssignRoleTemplatePermissionsDto } from '@/modules/admin-api/version/role-template/role-template-permission/dto/request/assign-role-template-permissions.dto';
import { RoleTemplateRepository } from '../../root/repositories/role-template.repository';
import {
  RoleTemplateFeaturePermissionRepository,
  type RoleTemplateFeaturePermissionWithDetails,
} from '../repositories/role-template-feature-permission.repository';

export interface GroupedPermission {
  featureCode: string;
  featureName: string;
  types: FeatureType[];
}

@Injectable()
export class RoleTemplatePermissionService {
  private readonly logger = new Logger(RoleTemplatePermissionService.name);

  constructor(
    private readonly roleTemplateRepository: RoleTemplateRepository,
    private readonly roleTemplateFeaturePermissionRepository: RoleTemplateFeaturePermissionRepository,
  ) {}

  // Returns permissions for a role template grouped by feature
  async findByRoleTemplate(roleTemplateId: string): Promise<GroupedPermission[]> {
    const roleTemplate = await this.roleTemplateRepository.findById(roleTemplateId);
    if (!roleTemplate) {
      throw new NotFoundException('Role template not found.');
    }

    const rows = await this.roleTemplateFeaturePermissionRepository.findByRoleTemplateId(roleTemplateId);
    this.logger.log(`Fetched permissions for role template: ${roleTemplateId} (${rows.length} entries)`);
    return this.groupByFeature(rows);
  }

  // Replaces all permissions for a role template with the given set
  async setPermissions(
    roleTemplateId: string,
    dto: AssignRoleTemplatePermissionsDto,
  ): Promise<{ success: true; message: string }> {
    const roleTemplate = await this.roleTemplateRepository.findById(roleTemplateId);
    if (!roleTemplate) {
      throw new NotFoundException('Role template not found.');
    }

    // Validate all featureIds exist
    const allFeatureIds = [...new Set(dto.permissions.map((p) => p.featureId))];
    if (allFeatureIds.length > 0) {
      await this.validateFeaturesExist(allFeatureIds);
    }

    // Full replace: delete all existing, then bulk insert
    const entries: NewRoleTemplateFeaturePermission[] = dto.permissions.map((perm) => ({
      versionId: roleTemplate.versionId,
      roleTemplateId,
      featureId: perm.featureId,
      type: perm.type,
    }));

    await this.roleTemplateFeaturePermissionRepository.transaction(async (tx) => {
      await this.roleTemplateFeaturePermissionRepository.deleteByRoleTemplateId(roleTemplateId, tx);
      await this.roleTemplateFeaturePermissionRepository.bulkCreate(entries, tx);
    });

    this.logger.log(`Set ${entries.length} permissions for role template: ${roleTemplate.name} (${roleTemplateId})`);
    return { success: true, message: `Permissions for "${roleTemplate.name}" updated successfully (${entries.length} grants).` };
  }

  // Returns features available for permission assignment (only from apps linked to this role template)
  async findAvailableFeatures(
    roleTemplateId: string,
  ): Promise<
    Array<{ id: string; code: string; name: string; icon: string; permissions: string[]; appCodes: string[] }>
  > {
    const roleTemplate = await this.roleTemplateRepository.findById(roleTemplateId);
    if (!roleTemplate) {
      throw new NotFoundException('Role template not found.');
    }
    const rows = await this.roleTemplateFeaturePermissionRepository.findAvailableFeatures(roleTemplateId);
    this.logger.log(`Fetched ${rows.length} available features for role template: ${roleTemplateId}`);
    return rows;
  }

  // Groups flat role-template-feature-permission rows by feature
  private groupByFeature(rows: RoleTemplateFeaturePermissionWithDetails[]): GroupedPermission[] {
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
    const existingFeatures = await this.roleTemplateFeaturePermissionRepository['db']
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
