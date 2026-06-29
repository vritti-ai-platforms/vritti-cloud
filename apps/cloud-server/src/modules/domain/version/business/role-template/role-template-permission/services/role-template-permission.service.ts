import { Injectable, Logger } from '@nestjs/common';
import { BadRequestException, NotFoundException } from '@vritti/api-sdk';
import type { NewRoleTemplateFeature, NewRoleTemplateFeaturePermission, RoleTemplate } from '@/db/schema';
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

// Composite key identifying a single per-platform feature membership
function membershipKey(featureId: string, platform: RoleTemplateMembership['platform']): string {
  return `${featureId}:${platform}`;
}

@Injectable()
export class RoleTemplatePermissionService {
  private readonly logger = new Logger(RoleTemplatePermissionService.name);

  constructor(
    private readonly roleTemplateRepository: RoleTemplateRepository,
    private readonly roleTemplateFeatureRepository: RoleTemplateFeatureRepository,
    private readonly roleTemplateFeaturePermissionRepository: RoleTemplateFeaturePermissionRepository,
  ) {}

  // Returns the matrix — the business's app/feature catalog with the role's current memberships nested under each app
  async getPermissions(roleTemplateId: string): Promise<RoleTemplatePermissionsResponse> {
    const roleTemplate = await this.ensureRoleTemplate(roleTemplateId);
    const [apps, memberships] = await Promise.all([
      this.roleTemplateFeaturePermissionRepository.findAvailableApps(roleTemplate.versionId, roleTemplate.businessId),
      this.roleTemplateFeatureRepository.findByRoleTemplateId(roleTemplateId),
    ]);

    this.logger.log(
      `Fetched permissions for role template ${roleTemplateId} (${apps.length} apps, ${memberships.length} memberships)`,
    );
    return { apps: nestMembershipsUnderApps(apps, memberships) };
  }

  // Replaces the role's memberships + their nested action grants in one transaction (full delete-then-insert)
  async setPermissions(
    roleTemplateId: string,
    dto: AssignRoleTemplatePermissionsDto,
  ): Promise<{ success: true; message: string }> {
    const roleTemplate = await this.ensureRoleTemplate(roleTemplateId);
    // The DTO's @ArrayUnique validator already guarantees one membership per (feature, platform)
    const memberships = dto.memberships;

    const permissionIds = [...new Set(memberships.flatMap((m) => m.permissions))];
    if (permissionIds.length > 0) {
      await this.validatePermissionsExist(permissionIds);
    }

    await this.roleTemplateFeatureRepository.transaction(async () => {
      await this.roleTemplateFeatureRepository.deleteByRoleTemplateId(roleTemplateId);
      // Insert memberships first so each returned row id can parent its action grants
      const inserted = await this.roleTemplateFeatureRepository.bulkCreate(
        buildMembershipRows(roleTemplate, memberships),
      );
      const membershipIdByKey = new Map(inserted.map((row) => [membershipKey(row.featureId, row.platform), row.id]));
      await this.roleTemplateFeaturePermissionRepository.bulkCreate(
        buildGrantRows(roleTemplate, memberships, membershipIdByKey),
      );
    });

    this.logger.log(
      `Set ${memberships.length} membership(s) + ${permissionIds.length} grant(s) for role template: ${roleTemplate.name} (${roleTemplateId})`,
    );
    return { success: true, message: `Permissions for "${roleTemplate.name}" updated successfully.` };
  }

  // Loads a role template or throws if it does not exist
  private async ensureRoleTemplate(roleTemplateId: string): Promise<RoleTemplate> {
    const roleTemplate = await this.roleTemplateRepository.findById(roleTemplateId);
    if (!roleTemplate) {
      throw new NotFoundException('Role template not found.');
    }
    return roleTemplate;
  }

  // Validates that every provided feature-permission id exists
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

// Nests each membership under the app that owns its feature (a feature pins to exactly one app)
function nestMembershipsUnderApps(apps: AvailableApp[], memberships: RoleTemplateMembership[]): AppWithMemberships[] {
  const appIdByFeatureId = new Map<string, string>();
  for (const app of apps) {
    for (const feature of app.features) {
      appIdByFeatureId.set(feature.id, app.id);
    }
  }

  const membershipsByAppId = new Map<string, RoleTemplateMembership[]>();
  for (const membership of memberships) {
    const appId = appIdByFeatureId.get(membership.featureId);
    if (!appId) continue;
    const list = membershipsByAppId.get(appId) ?? [];
    list.push(membership);
    membershipsByAppId.set(appId, list);
  }

  return apps.map((app) => ({ ...app, memberships: membershipsByAppId.get(app.id) ?? [] }));
}

// Builds the membership rows (one per feature+platform) to insert for a role template
function buildMembershipRows(
  roleTemplate: RoleTemplate,
  memberships: RoleTemplateMembership[],
): NewRoleTemplateFeature[] {
  return memberships.map((m) => ({
    versionId: roleTemplate.versionId,
    roleTemplateId: roleTemplate.id,
    businessId: roleTemplate.businessId,
    featureId: m.featureId,
    platform: m.platform,
  }));
}

// Builds the action-grant rows, each linked to its parent membership row via membershipIdByKey
function buildGrantRows(
  roleTemplate: RoleTemplate,
  memberships: RoleTemplateMembership[],
  membershipIdByKey: Map<string, string>,
): NewRoleTemplateFeaturePermission[] {
  const rows: NewRoleTemplateFeaturePermission[] = [];
  for (const m of memberships) {
    const membershipId = membershipIdByKey.get(membershipKey(m.featureId, m.platform));
    if (!membershipId) continue;
    for (const featurePermissionId of new Set(m.permissions)) {
      rows.push({
        versionId: roleTemplate.versionId,
        roleTemplateId: roleTemplate.id,
        roleTemplateFeatureId: membershipId,
        featurePermissionId,
      });
    }
  }
  return rows;
}
