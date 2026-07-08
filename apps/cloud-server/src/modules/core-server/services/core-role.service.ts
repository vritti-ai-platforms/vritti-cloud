import type { RoleItem } from '@domain/catalog/catalog.builder';
import { Injectable, Logger } from '@nestjs/common';
import type { CreateResponseDto, SuccessResponseDto } from '@vritti/api-sdk/database';
import type { CoreRole } from '@/modules/cloud-api/organization/organization-business-units/types';
import { CoreHttpService } from './core-http.service';

// Proxies role management calls to core-server. orgId is sent as `x-org-id` for RLS scoping.
@Injectable()
export class CoreRoleService {
  private readonly logger = new Logger(CoreRoleService.name);

  constructor(private readonly http: CoreHttpService) {}

  // Fetches all roles for an organization from core
  async getOrgRoles(url: string, signingKey: string, orgId: string): Promise<CoreRole[]> {
    const result = await this.http.get<CoreRole[]>(url, signingKey, '/organizations/internal/roles', {
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
  ): Promise<CreateResponseDto<CoreRole>> {
    const result = await this.http.post<CreateResponseDto<CoreRole>>(
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

  // Fetches roles compatible with a business unit's assigned apps from core
  async getCompatibleRoles(url: string, signingKey: string, orgId: string, buId: string): Promise<CoreRole[]> {
    const result = await this.http.get<CoreRole[]>(url, signingKey, '/organizations/internal/roles/compatible', {
      orgId,
      params: { buId },
    });
    this.logger.log(`Fetched compatible roles for BU ${buId} from core`);
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
