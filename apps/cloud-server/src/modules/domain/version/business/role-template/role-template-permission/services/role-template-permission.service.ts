import { Injectable, Logger } from '@nestjs/common';
import { BadRequestException, NotFoundException } from '@vritti/api-sdk';
import type { NewRoleTemplateFeature, NewRoleTemplateFeaturePermission } from '@/db/schema';
import type { AssignRoleTemplatePermissionsDto } from '@/modules/admin-api/version/business/role-template/role-template-permission/dto/request/assign-role-template-permissions.dto';
import { RoleTemplateRepository } from '../../root/repositories/role-template.repository';
import {
  RoleTemplateFeatureRepository,
  type RoleTemplateMembership,
} from '../repositories/role-template-feature.repository';
import {
  type AvailableApp,
  RoleTemplateFeaturePermissionRepository,
} from '../repositories/role-template-feature-permission.repository';

// An app (catalog) plus the role's current memberships for its features
export interface AppWithMemberships extends AvailableApp {
  memberships: RoleTemplateMembership[];
}

// The matrix payload: apps carry both their feature catalog and the role's nested memberships
export interface RoleTemplatePermissionsResponse {
  apps: AppWithMemberships[];
}

@Injectable()
export class RoleTemplatePermissionService {
  private readonly logger = new Logger(RoleTemplatePermissionService.name);

  constructor(
    private readonly roleTemplateRepository: RoleTemplateRepository,
    private readonly roleTemplateFeatureRepository: RoleTemplateFeatureRepository,
    private readonly roleTemplateFeaturePermissionRepository: RoleTemplateFeaturePermissionRepository,
  ) {}

  // Returns the matrix source — apps (catalog) each with the role's current memberships nested under it.
  async getPermissions(roleTemplateId: string): Promise<RoleTemplatePermissionsResponse> {
    const roleTemplate = await this.roleTemplateRepository.findById(roleTemplateId);
    if (!roleTemplate) {
      throw new NotFoundException('Role template not found.');
    }
    const [apps, memberships] = await Promise.all([
      this.roleTemplateFeaturePermissionRepository.findAvailableApps(roleTemplate.versionId, roleTemplate.businessId),
      this.roleTemplateFeatureRepository.findByRoleTemplateId(roleTemplateId),
    ]);

    // Attach each membership to the app that owns its feature (a feature pins to one app)
    const appIdByFeatureId = new Map<string, string>();
    for (const app of apps) for (const f of app.features) appIdByFeatureId.set(f.id, app.id);
    const membershipsByAppId = new Map<string, RoleTemplateMembership[]>();
    for (const m of memberships) {
      const appId = appIdByFeatureId.get(m.featureId);
      if (!appId) continue;
      const list = membershipsByAppId.get(appId) ?? [];
      list.push(m);
      membershipsByAppId.set(appId, list);
    }
    const appsWithMemberships: AppWithMemberships[] = apps.map((app) => ({
      ...app,
      memberships: membershipsByAppId.get(app.id) ?? [],
    }));

    this.logger.log(
      `Fetched permissions for role template ${roleTemplateId} (${apps.length} apps, ${memberships.length} memberships)`,
    );
    return { apps: appsWithMemberships };
  }

  // Replaces the role's memberships + their nested action grants (delete-all, then insert). Each membership row
  // owns its grants; the payload nests permissions under the membership, so no permission→feature lookup is needed.
  async setPermissions(
    roleTemplateId: string,
    dto: AssignRoleTemplatePermissionsDto,
  ): Promise<{ success: true; message: string }> {
    const roleTemplate = await this.roleTemplateRepository.findById(roleTemplateId);
    if (!roleTemplate) {
      throw new NotFoundException('Role template not found.');
    }

    // De-duplicate memberships by (feature, platform)
    const byKey = new Map<
      string,
      { featureId: string; platform: RoleTemplateMembership['platform']; permissions: string[] }
    >();
    for (const m of dto.memberships) {
      byKey.set(`${m.featureId}:${m.platform}`, {
        featureId: m.featureId,
        platform: m.platform,
        permissions: m.permissions,
      });
    }
    const memberships = [...byKey.values()];

    const allPermissionIds = [...new Set(memberships.flatMap((m) => m.permissions))];
    if (allPermissionIds.length > 0) {
      await this.validatePermissionsExist(allPermissionIds);
    }

    await this.roleTemplateFeatureRepository.transaction(async (tx) => {
      await this.roleTemplateFeatureRepository.deleteByRoleTemplateId(roleTemplateId, tx);

      const membershipEntries: NewRoleTemplateFeature[] = memberships.map((m) => ({
        versionId: roleTemplate.versionId,
        roleTemplateId,
        featureId: m.featureId,
        platform: m.platform,
      }));
      const inserted = await this.roleTemplateFeatureRepository.bulkCreate(membershipEntries, tx);
      const membershipIdByKey = new Map(inserted.map((r) => [`${r.featureId}:${r.platform}`, r.id]));

      const grantEntries: NewRoleTemplateFeaturePermission[] = [];
      for (const m of memberships) {
        const membershipId = membershipIdByKey.get(`${m.featureId}:${m.platform}`);
        if (!membershipId) continue;
        for (const featurePermissionId of new Set(m.permissions)) {
          grantEntries.push({
            versionId: roleTemplate.versionId,
            roleTemplateId,
            roleTemplateFeatureId: membershipId,
            featurePermissionId,
          });
        }
      }
      await this.roleTemplateFeaturePermissionRepository.bulkCreate(grantEntries, tx);
    });

    this.logger.log(
      `Set ${memberships.length} membership(s) + ${allPermissionIds.length} grant(s) for role template: ${roleTemplate.name} (${roleTemplateId})`,
    );
    return {
      success: true,
      message: `Permissions for "${roleTemplate.name}" updated successfully.`,
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
