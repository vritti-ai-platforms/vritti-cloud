import { Injectable, Logger } from '@nestjs/common';
import type { ScopeType, SiteType, SnapshotRoleTemplate, VersionSnapshot } from '@vritti/api-sdk/catalog-resolver';
import type { CreateResponseDto, SuccessResponseDto } from '@vritti/api-sdk/database';
import { NotFoundException } from '@vritti/api-sdk/exceptions';
import type { CoreRoleDto } from '@/modules/cloud-api/organization/dto/entity/core-role.dto';
import { CoreVersionRepository } from '@/modules/core-server/repositories/core-version.repository';
import { CoreDeploymentService } from '@/modules/core-server/services/core-deployment.service';
import { CoreRoleService } from '@/modules/core-server/services/core-role.service';
import type { RolesByScopeDto } from '@/modules/cloud-api/organization/organization-roles/dto/response/roles-by-scope.response.dto';
import { requireSigningKey } from '@/modules/core-server/signing-key.util';
import type { RoleScopeSectionDto } from '../dto/response/role-sections.response.dto';

const SCOPE_ORDER: ScopeType[] = ['ORG', 'LE', 'SITE_GROUP', 'SITE'];
const SITE_TYPE_ORDER: SiteType[] = ['OUTLET', 'WAREHOUSE', 'PRODUCTION'];

const byName = (a: { name: string }, b: { name: string }) => a.name.localeCompare(b.name);

@Injectable()
export class OrganizationRolesService {
  private readonly logger = new Logger(OrganizationRolesService.name);

  constructor(
    private readonly coreDeploymentService: CoreDeploymentService,
    private readonly coreRoleService: CoreRoleService,
    private readonly coreVersionRepository: CoreVersionRepository,
  ) {}

  // Returns the organization's roles as render-ready sections: templates (with their enabled role) + custom roles per scope
  async getRoleSections(orgId: string): Promise<RoleScopeSectionDto[]> {
    const { org, deployment } = await this.coreDeploymentService.resolveOrgDeployment(orgId);

    if (!deployment.version) {
      throw new NotFoundException('No app version linked to this deployment.');
    }
    const appVersion = await this.coreVersionRepository.findByVersion(deployment.version);
    if (!appVersion?.snapshot) {
      throw new NotFoundException('No snapshot available for this deployment.');
    }

    const snapshot = appVersion.snapshot as VersionSnapshot;
    const templates = Object.values(snapshot.businesses?.[org.businessCode]?.roleTemplates ?? {});
    const roles = await this.coreRoleService.getOrgRoles(
      deployment.url,
      requireSigningKey(deployment),
      org.orgIdentifier,
    );

    this.logger.log(`Assembled role sections for org ${orgId} (${templates.length} templates)`);
    return this.assembleSections(roles, templates);
  }

  // Merges snapshot templates with grouped DB roles into scope sections; SITE splits by site type
  private assembleSections(roles: RolesByScopeDto, templates: SnapshotRoleTemplate[]): RoleScopeSectionDto[] {
    const templateByCode = new Map(templates.map((t) => [t.code, t]));
    const isCustom = (role: CoreRoleDto) => !role.code || templateByCode.get(role.code)?.name !== role.name;

    // A template plus its enabled default-role instance (same code and name), if one exists
    const toTemplateRow = (template: SnapshotRoleTemplate, scopeRoles: CoreRoleDto[]) => ({
      template,
      role: scopeRoles.find((r) => r.code === template.code && r.name === template.name) ?? null,
    });

    return SCOPE_ORDER.map((scope) => {
      const scopeTemplates = templates.filter((t) => t.scope === scope).sort(byName);

      if (scope === 'SITE') {
        const siteTypeGroups = SITE_TYPE_ORDER.map((siteType) => {
          const siteRoles = roles.SITE[siteType] ?? [];
          return {
            siteType,
            templates: scopeTemplates.filter((t) => t.siteType === siteType).map((t) => toTemplateRow(t, siteRoles)),
            customRoles: siteRoles.filter(isCustom).sort(byName),
          };
        }).filter((group) => group.templates.length > 0 || group.customRoles.length > 0);
        return { scope, templates: [], customRoles: [], siteTypeGroups };
      }

      const scopeRoles = roles[scope] ?? [];
      return {
        scope,
        templates: scopeTemplates.map((t) => toTemplateRow(t, scopeRoles)),
        customRoles: scopeRoles.filter(isCustom).sort(byName),
        siteTypeGroups: [],
      };
    });
  }

  // Creates a new role in core for the organization
  async createRole(orgId: string, data: Record<string, unknown>): Promise<CreateResponseDto<CoreRoleDto>> {
    const { org, deployment } = await this.coreDeploymentService.resolveOrgDeployment(orgId);

    const result = await this.coreRoleService.createOrgRole(
      deployment.url,
      requireSigningKey(deployment),
      org.orgIdentifier,
      data,
    );
    this.logger.log(`Created role for org ${orgId}`);
    return result;
  }

  // Updates a role in core
  async updateRole(orgId: string, roleId: string, data: Record<string, unknown>): Promise<SuccessResponseDto> {
    const { org, deployment } = await this.coreDeploymentService.resolveOrgDeployment(orgId);

    const result = await this.coreRoleService.updateOrgRole(
      deployment.url,
      requireSigningKey(deployment),
      org.orgIdentifier,
      roleId,
      data,
    );
    this.logger.log(`Updated role ${roleId} for org ${orgId}`);
    return result;
  }

  // Deletes a role in core
  async deleteRole(orgId: string, roleId: string): Promise<SuccessResponseDto> {
    const { org, deployment } = await this.coreDeploymentService.resolveOrgDeployment(orgId);

    const result = await this.coreRoleService.deleteOrgRole(
      deployment.url,
      requireSigningKey(deployment),
      org.orgIdentifier,
      roleId,
    );
    this.logger.log(`Deleted role ${roleId} for org ${orgId}`);
    return result;
  }
}
