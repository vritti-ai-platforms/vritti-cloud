import { Injectable, Logger } from '@nestjs/common';
import { buildDependsMap, filterGrantedByDeps, prereqClosure } from '@vritti/api-sdk/catalog-resolver';
import type { SuccessResponseDto } from '@vritti/api-sdk/database';
import { BadRequestException, NotFoundException } from '@vritti/api-sdk/exceptions';
import type { NewRoleTemplateFeature, NewRoleTemplateFeaturePermission, RoleTemplate } from '@/db/schema';
import type { AssignRoleTemplatePermissionsDto } from '@/modules/admin-api/version/business/role-template/role-template-permission/dto/request/assign-role-template-permissions.dto';
import { RoleTemplateRepository } from '../../root/repositories/role-template.repository';
import {
  RoleTemplateFeatureRepository,
  type RoleTemplateGrant,
} from '../repositories/role-template-feature.repository';
import {
  type AvailableApp,
  RoleTemplateFeaturePermissionRepository,
} from '../repositories/role-template-feature-permission.repository';

// An app (catalog) plus the role's current grants for its features
export interface AppWithGrants extends AvailableApp {
  grants: RoleTemplateGrant[];
}

// The matrix payload: apps carry both their feature catalog and the role's nested grants
export interface RoleTemplatePermissionsResponse {
  apps: AppWithGrants[];
}

// Composite key identifying a single per-platform feature grant
function cellKey(featureId: string, platform: RoleTemplateGrant['platform']): string {
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

  // Returns the matrix — the business's app/feature catalog with the role's current grants nested under each app
  async getPermissions(roleTemplateId: string): Promise<RoleTemplatePermissionsResponse> {
    const roleTemplate = await this.ensureRoleTemplate(roleTemplateId);
    const [apps, grants] = await Promise.all([
      this.roleTemplateFeaturePermissionRepository.findAvailableApps(roleTemplate.versionId, roleTemplate.businessId),
      this.roleTemplateFeatureRepository.findByRoleTemplateId(roleTemplateId),
    ]);

    this.logger.log(
      `Fetched permissions for role template ${roleTemplateId} (${apps.length} apps, ${grants.length} grants)`,
    );
    return { apps: nestGrantsUnderApps(apps, grants) };
  }

  // Replaces the role's grants + their nested action permissions in one transaction (full delete-then-insert)
  async setPermissions(roleTemplateId: string, dto: AssignRoleTemplatePermissionsDto): Promise<SuccessResponseDto> {
    const roleTemplate = await this.ensureRoleTemplate(roleTemplateId);
    // The DTO's @ArrayUnique validator already guarantees one grant per (feature, platform)
    const grants = dto.grants;

    await this.assertScopeTypesMatch(roleTemplate, grants);
    const permissionIds = [...new Set(grants.flatMap((g) => g.permissions))];
    if (permissionIds.length > 0) {
      await this.validatePermissionsExist(permissionIds);
    }
    await this.assertPrerequisitesGranted(grants, permissionIds);

    await this.roleTemplateFeatureRepository.transaction(async () => {
      await this.roleTemplateFeatureRepository.deleteByRoleTemplateId(roleTemplateId);
      // Insert the feature rows first so each returned row id can parent its action permissions
      const inserted = await this.roleTemplateFeatureRepository.bulkCreate(buildFeatureRows(roleTemplate, grants));
      const roleFeatureIdByKey = new Map(inserted.map((row) => [cellKey(row.featureId, row.platform), row.id]));
      await this.roleTemplateFeaturePermissionRepository.bulkCreate(
        buildPermissionRows(roleTemplate, grants, roleFeatureIdByKey),
      );
    });

    this.logger.log(
      `Set ${grants.length} grant(s) + ${permissionIds.length} permission(s) for role template: ${roleTemplate.name} (${roleTemplateId})`,
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

  private async assertScopeTypesMatch(roleTemplate: RoleTemplate, grants: RoleTemplateGrant[]): Promise<void> {
    const featureIds = [...new Set(grants.map((g) => g.featureId))];
    if (featureIds.length === 0) return;
    const featureById = await this.roleTemplateFeaturePermissionRepository.findScopeTypesByIds(featureIds);
    const mismatchedCodes: string[] = [];
    for (const id of featureIds) {
      const feature = featureById.get(id);
      if (feature && feature.scope !== roleTemplate.scope) mismatchedCodes.push(feature.code);
    }
    if (mismatchedCodes.length === 0) return;
    throw new BadRequestException({
      label: 'Scope Mismatch',
      detail: `The features ${mismatchedCodes.join(', ')} cannot be granted to a ${roleTemplate.scope}-scoped role template.`,
    });
  }

  // Rejects any (feature, platform) grant set whose granted permissions are missing a required prerequisite
  private async assertPrerequisitesGranted(grants: RoleTemplateGrant[], permissionIds: string[]): Promise<void> {
    const featureIds = [...new Set(grants.map((g) => g.featureId))];
    const [depsByFeature, codeById] = await Promise.all([
      this.roleTemplateFeaturePermissionRepository.findDependsOnCodesByFeatureIds(featureIds),
      this.roleTemplateFeaturePermissionRepository.findPermissionCodesByIds(permissionIds),
    ]);

    for (const g of grants) {
      const codeMap = depsByFeature.get(g.featureId);
      if (!codeMap) continue;
      const deps = buildDependsMap([...codeMap].map(([code, dependsOn]) => ({ code, dependsOn })));
      const grantedCodes = new Set<string>();
      for (const id of g.permissions) {
        const meta = codeById.get(id);
        if (meta && meta.featureId === g.featureId) grantedCodes.add(meta.code);
      }
      const satisfied = filterGrantedByDeps(grantedCodes, deps);
      if (satisfied.size === grantedCodes.size) continue;

      const problems: string[] = [];
      for (const code of grantedCodes) {
        const missing = prereqClosure(code, deps).filter((dep) => !grantedCodes.has(dep));
        if (missing.length > 0) problems.push(`${code} requires ${missing.join(', ')}`);
      }
      throw new BadRequestException({
        label: 'Missing Prerequisites',
        detail: `Grant the prerequisite permissions first: ${problems.join('; ')}.`,
      });
    }
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

// Nests each grant under the app that owns its feature (a feature pins to exactly one app)
function nestGrantsUnderApps(apps: AvailableApp[], grants: RoleTemplateGrant[]): AppWithGrants[] {
  const appIdByFeatureId = new Map<string, string>();
  for (const app of apps) {
    for (const feature of app.features) {
      appIdByFeatureId.set(feature.id, app.id);
    }
  }

  const grantsByAppId = new Map<string, RoleTemplateGrant[]>();
  for (const grant of grants) {
    const appId = appIdByFeatureId.get(grant.featureId);
    if (!appId) continue;
    const list = grantsByAppId.get(appId) ?? [];
    list.push(grant);
    grantsByAppId.set(appId, list);
  }

  return apps.map((app) => ({ ...app, grants: grantsByAppId.get(app.id) ?? [] }));
}

// Builds the feature rows (one per feature+platform) to insert for a role template
function buildFeatureRows(roleTemplate: RoleTemplate, grants: RoleTemplateGrant[]): NewRoleTemplateFeature[] {
  return grants.map((g) => ({
    versionId: roleTemplate.versionId,
    roleTemplateId: roleTemplate.id,
    businessId: roleTemplate.businessId,
    featureId: g.featureId,
    platform: g.platform,
  }));
}

// Builds the action-permission rows, each linked to its parent feature row via roleFeatureIdByKey
function buildPermissionRows(
  roleTemplate: RoleTemplate,
  grants: RoleTemplateGrant[],
  roleFeatureIdByKey: Map<string, string>,
): NewRoleTemplateFeaturePermission[] {
  const rows: NewRoleTemplateFeaturePermission[] = [];
  for (const g of grants) {
    const roleTemplateFeatureId = roleFeatureIdByKey.get(cellKey(g.featureId, g.platform));
    if (!roleTemplateFeatureId) continue;
    for (const featurePermissionId of new Set(g.permissions)) {
      rows.push({
        versionId: roleTemplate.versionId,
        roleTemplateId: roleTemplate.id,
        roleTemplateFeatureId,
        featurePermissionId,
      });
    }
  }
  return rows;
}
