import { Injectable, Logger } from '@nestjs/common';
import { BadRequestException, NotFoundException } from '@vritti/api-sdk';
import type { NewRoleTemplateFeaturePermission } from '@/db/schema';
import type { AssignRoleTemplatePermissionsDto } from '@/modules/admin-api/version/business/role-template/role-template-permission/dto/request/assign-role-template-permissions.dto';
import { RoleTemplateRepository } from '../../root/repositories/role-template.repository';
import {
  type AvailableApp,
  RoleTemplateFeaturePermissionRepository,
  type RoleTemplateGrant,
} from '../repositories/role-template-feature-permission.repository';

// The full matrix payload: the assignable apps (each with its features) + the complete current grant set
export interface RoleTemplatePermissionsResponse {
  apps: AvailableApp[];
  grants: RoleTemplateGrant[];
}

@Injectable()
export class RoleTemplatePermissionService {
  private readonly logger = new Logger(RoleTemplatePermissionService.name);

  constructor(
    private readonly roleTemplateRepository: RoleTemplateRepository,
    private readonly roleTemplateFeaturePermissionRepository: RoleTemplateFeaturePermissionRepository,
  ) {}

  // Returns the matrix source — the role template's apps (each with its features) plus the full grant set.
  async getPermissions(roleTemplateId: string): Promise<RoleTemplatePermissionsResponse> {
    const roleTemplate = await this.roleTemplateRepository.findById(roleTemplateId);
    if (!roleTemplate) {
      throw new NotFoundException('Role template not found.');
    }
    const [apps, grants] = await Promise.all([
      this.roleTemplateFeaturePermissionRepository.findAvailableApps(roleTemplate.versionId, roleTemplate.businessId),
      this.roleTemplateFeaturePermissionRepository.findGrantsByRoleTemplateId(roleTemplateId),
    ]);
    this.logger.log(
      `Fetched permissions for role template ${roleTemplateId} (${apps.length} apps, ${grants.length} grants)`,
    );
    return { apps, grants };
  }

  // Replaces all grants for a role template with the given set of (permission, platform) pairs
  async setPermissions(
    roleTemplateId: string,
    dto: AssignRoleTemplatePermissionsDto,
  ): Promise<{ success: true; message: string }> {
    const roleTemplate = await this.roleTemplateRepository.findById(roleTemplateId);
    if (!roleTemplate) {
      throw new NotFoundException('Role template not found.');
    }

    // De-duplicate (featurePermissionId, platform) pairs
    const seen = new Set<string>();
    const grants = dto.grants.filter((g) => {
      const key = `${g.featurePermissionId}:${g.platform}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    const ids = [...new Set(grants.map((g) => g.featurePermissionId))];
    if (ids.length > 0) {
      await this.validatePermissionsExist(ids);
    }

    const entries: NewRoleTemplateFeaturePermission[] = grants.map((g) => ({
      versionId: roleTemplate.versionId,
      roleTemplateId,
      featurePermissionId: g.featurePermissionId,
      platform: g.platform,
    }));

    await this.roleTemplateFeaturePermissionRepository.transaction(async (tx) => {
      await this.roleTemplateFeaturePermissionRepository.deleteByRoleTemplateId(roleTemplateId, tx);
      await this.roleTemplateFeaturePermissionRepository.bulkCreate(entries, tx);
    });

    this.logger.log(`Set ${entries.length} grants for role template: ${roleTemplate.name} (${roleTemplateId})`);
    return {
      success: true,
      message: `Permissions for "${roleTemplate.name}" updated successfully (${entries.length} grants).`,
    };
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
