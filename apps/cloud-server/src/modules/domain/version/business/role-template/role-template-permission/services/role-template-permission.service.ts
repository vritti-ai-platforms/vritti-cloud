import { Injectable, Logger } from '@nestjs/common';
import { BadRequestException, NotFoundException } from '@vritti/api-sdk';
import type { NewRoleTemplateFeaturePermission } from '@/db/schema';
import type { AssignRoleTemplatePermissionsDto } from '@/modules/admin-api/version/business/role-template/role-template-permission/dto/request/assign-role-template-permissions.dto';
import { RoleTemplateRepository } from '../../root/repositories/role-template.repository';
import {
  type AvailableFeature,
  RoleTemplateFeaturePermissionRepository,
  type RoleTemplateFeaturePermissionWithDetails,
} from '../repositories/role-template-feature-permission.repository';

export interface GroupedPermissionEntry {
  featurePermissionId: string;
  code: string;
  label: string;
}

export interface GroupedPermission {
  featureCode: string;
  featureName: string;
  permissions: GroupedPermissionEntry[];
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

  // Replaces all grants for a role template with the given set of feature-permission IDs
  async setPermissions(
    roleTemplateId: string,
    dto: AssignRoleTemplatePermissionsDto,
  ): Promise<{ success: true; message: string }> {
    const roleTemplate = await this.roleTemplateRepository.findById(roleTemplateId);
    if (!roleTemplate) {
      throw new NotFoundException('Role template not found.');
    }

    const ids = [...new Set(dto.featurePermissionIds)];
    if (ids.length > 0) {
      await this.validatePermissionsExist(ids);
    }

    const entries: NewRoleTemplateFeaturePermission[] = ids.map((featurePermissionId) => ({
      versionId: roleTemplate.versionId,
      roleTemplateId,
      featurePermissionId,
    }));

    await this.roleTemplateFeaturePermissionRepository.transaction(async (tx) => {
      await this.roleTemplateFeaturePermissionRepository.deleteByRoleTemplateId(roleTemplateId, tx);
      await this.roleTemplateFeaturePermissionRepository.bulkCreate(entries, tx);
    });

    this.logger.log(`Set ${entries.length} permissions for role template: ${roleTemplate.name} (${roleTemplateId})`);
    return {
      success: true,
      message: `Permissions for "${roleTemplate.name}" updated successfully (${entries.length} grants).`,
    };
  }

  // Returns features available for permission assignment (only from apps linked to this role template),
  // scoped to the role template's business so only global + business-specific permissions are offered
  async findAvailableFeatures(roleTemplateId: string): Promise<AvailableFeature[]> {
    const roleTemplate = await this.roleTemplateRepository.findById(roleTemplateId);
    if (!roleTemplate) {
      throw new NotFoundException('Role template not found.');
    }
    const rows = await this.roleTemplateFeaturePermissionRepository.findAvailableFeatures(
      roleTemplateId,
      roleTemplate.businessId,
    );
    this.logger.log(`Fetched ${rows.length} available features for role template: ${roleTemplateId}`);
    return rows;
  }

  // Groups flat grant rows by feature
  private groupByFeature(rows: RoleTemplateFeaturePermissionWithDetails[]): GroupedPermission[] {
    const map = new Map<string, GroupedPermission>();

    for (const row of rows) {
      let group = map.get(row.featureId);
      if (!group) {
        group = { featureCode: row.featureCode, featureName: row.featureName, permissions: [] };
        map.set(row.featureId, group);
      }
      group.permissions.push({ featurePermissionId: row.featurePermissionId, code: row.code, label: row.label });
    }

    return Array.from(map.values());
  }

  // Validates that all provided feature-permission IDs exist
  private async validatePermissionsExist(ids: string[]): Promise<void> {
    const existing = new Set(await this.roleTemplateFeaturePermissionRepository.findExistingFeaturePermissionIds(ids));
    const missing = ids.filter((id) => !existing.has(id));

    if (missing.length > 0) {
      throw new BadRequestException({
        label: 'Invalid Permissions',
        detail: `The following permission IDs do not exist: ${missing.join(', ')}`,
      });
    }
  }
}
