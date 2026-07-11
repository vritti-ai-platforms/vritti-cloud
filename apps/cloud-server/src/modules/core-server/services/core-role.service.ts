import type { RoleItem } from '@domain/catalog/catalog.builder';
import { Injectable, Logger } from '@nestjs/common';
import type { CreateResponseDto, SuccessResponseDto } from '@vritti/api-sdk/database';
import type { CoreRoleDto } from '@/modules/cloud-api/organization/dto/entity/core-role.dto';
import type { RoleAssignmentDto } from '@/modules/cloud-api/organization/dto/entity/role-assignment.dto';
import { CoreHttpService } from './core-http.service';

export type RoleAssignmentTarget = { siteId?: string; siteGroupId?: string; legalEntityId?: string };

// Proxies role management calls to core-server. orgId is sent as `x-org-id` for RLS scoping.
@Injectable()
export class CoreRoleService {
  private readonly logger = new Logger(CoreRoleService.name);

  constructor(private readonly http: CoreHttpService) {}

  // Fetches all roles for an organization from core
  async getOrgRoles(url: string, signingKey: string, orgId: string): Promise<CoreRoleDto[]> {
    const result = await this.http.get<CoreRoleDto[]>(url, signingKey, '/organizations/internal/roles', {
      orgId,
      params: { orgId },
    });
    this.logger.log(`Fetched ${result.length} roles from core for org: ${orgId}`);
    return result;
  }

  // Creates a new role for an organization in core
  async createOrgRole(
    url: string,
    signingKey: string,
    orgId: string,
    roleData: Record<string, unknown>,
  ): Promise<CreateResponseDto<CoreRoleDto>> {
    const result = await this.http.post<CreateResponseDto<CoreRoleDto>>(
      url,
      signingKey,
      '/organizations/internal/roles/create',
      { orgId, ...roleData },
      { orgId },
    );
    this.logger.log(`Created role for org ${orgId} in core`);
    return result;
  }

  // Updates a role in core
  async updateOrgRole(
    url: string,
    signingKey: string,
    orgId: string,
    roleId: string,
    data: Record<string, unknown>,
  ): Promise<SuccessResponseDto> {
    const result = await this.http.patch<SuccessResponseDto>(
      url,
      signingKey,
      `/organizations/internal/roles/${roleId}`,
      data,
      { orgId },
    );
    this.logger.log(`Updated role ${roleId} in core`);
    return result;
  }

  // Provisions role templates for an organization in core (idempotent — core upserts existing by code)
  async provisionRoles(url: string, signingKey: string, orgId: string, roles: RoleItem[]): Promise<SuccessResponseDto> {
    const result = await this.http.post<SuccessResponseDto>(
      url,
      signingKey,
      '/organizations/internal/roles',
      { orgId, roles },
      { orgId },
    );
    this.logger.log(`Provisioned ${roles.length} role template(s) for org ${orgId} in core`);
    return result;
  }

  // Fetches roles compatible with a site's assigned apps from core
  async getCompatibleRoles(url: string, signingKey: string, orgId: string, siteId: string): Promise<CoreRoleDto[]> {
    const result = await this.http.get<CoreRoleDto[]>(url, signingKey, '/organizations/internal/roles/for-site', {
      orgId,
      params: { siteId },
    });
    this.logger.log(`Fetched compatible roles for site ${siteId} from core`);
    return result;
  }

  // Fetches roles assignable at a target (ORG, LE, SITE_GROUP, or SITE) from core
  async getCompatibleRolesForTarget(
    url: string,
    signingKey: string,
    orgId: string,
    targetType: 'ORG' | 'LE' | 'SITE_GROUP' | 'SITE',
    targetId?: string,
  ): Promise<CoreRoleDto[]> {
    const result = await this.http.get<CoreRoleDto[]>(url, signingKey, '/organizations/internal/roles/for-target', {
      orgId,
      params: { targetType, ...(targetId ? { targetId } : {}) },
    });
    this.logger.log(`Fetched compatible roles for ${targetType} target from core for org: ${orgId}`);
    return result;
  }

  // Fetches role assignments targeting a site group from core
  async getSiteGroupRoleAssignments(
    url: string,
    signingKey: string,
    orgId: string,
    siteGroupId: string,
  ): Promise<RoleAssignmentDto[]> {
    const result = await this.http.get<RoleAssignmentDto[]>(
      url,
      signingKey,
      `/site-groups/internal/${siteGroupId}/role-assignments`,
      { orgId },
    );
    this.logger.log(`Fetched ${result.length} role assignments for site group ${siteGroupId} from core`);
    return result;
  }

  // Fetches role assignments targeting a legal entity from core
  async getLegalEntityRoleAssignments(
    url: string,
    signingKey: string,
    orgId: string,
    legalEntityId: string,
  ): Promise<RoleAssignmentDto[]> {
    const result = await this.http.get<RoleAssignmentDto[]>(
      url,
      signingKey,
      `/legal-entities/internal/${legalEntityId}/role-assignments`,
      { orgId },
    );
    this.logger.log(`Fetched ${result.length} role assignments for legal entity ${legalEntityId} from core`);
    return result;
  }

  // Fetches org-wide role assignments from core
  async getOrgRoleAssignments(url: string, signingKey: string, orgId: string): Promise<RoleAssignmentDto[]> {
    const result = await this.http.get<RoleAssignmentDto[]>(
      url,
      signingKey,
      '/organizations/internal/role-assignments',
      { orgId },
    );
    this.logger.log(`Fetched ${result.length} org-wide role assignments from core for org: ${orgId}`);
    return result;
  }

  // Assigns a role to a user at a target in core (no target = org-wide)
  async assignRole(
    url: string,
    signingKey: string,
    orgId: string,
    userId: string,
    data: { roleId: string } & RoleAssignmentTarget,
  ): Promise<SuccessResponseDto> {
    const result = await this.http.post<SuccessResponseDto>(url, signingKey, `/users/internal/${userId}/roles`, data, {
      orgId,
    });
    this.logger.log(`Assigned role to user ${userId} in core`);
    return result;
  }

  // Removes a role assignment in core (core deletes by assignment ID; the userId path segment is ignored)
  async removeRoleAssignment(
    url: string,
    signingKey: string,
    orgId: string,
    assignmentId: string,
  ): Promise<SuccessResponseDto> {
    const result = await this.http.delete<SuccessResponseDto>(
      url,
      signingKey,
      `/users/internal/_/roles/${assignmentId}`,
      {
        orgId,
      },
    );
    this.logger.log(`Removed role assignment ${assignmentId} in core`);
    return result;
  }

  // Deletes a role in core
  async deleteOrgRole(url: string, signingKey: string, orgId: string, roleId: string): Promise<SuccessResponseDto> {
    const result = await this.http.delete<SuccessResponseDto>(
      url,
      signingKey,
      `/organizations/internal/roles/${roleId}`,
      { orgId },
    );
    this.logger.log(`Deleted role ${roleId} in core`);
    return result;
  }
}
