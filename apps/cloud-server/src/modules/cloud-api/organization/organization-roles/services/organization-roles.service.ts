import { Injectable, Logger } from '@nestjs/common';
import { type CreateResponseDto, NotFoundException, type SuccessResponseDto } from '@vritti/api-sdk';
import type { CoreRole } from '@/modules/cloud-api/organization/organization-business-units/types';
import { CoreVersionRepository } from '@/modules/core-server/repositories/core-version.repository';
import { CoreDeploymentService } from '@/modules/core-server/services/core-deployment.service';
import { CoreRoleService } from '@/modules/core-server/services/core-role.service';
import type { RoleTemplateListResponseDto } from '../dto/response/role-template.response.dto';

@Injectable()
export class OrganizationRolesService {
  private readonly logger = new Logger(OrganizationRolesService.name);

  constructor(
    private readonly coreDeploymentService: CoreDeploymentService,
    private readonly coreRoleService: CoreRoleService,
    private readonly coreVersionRepository: CoreVersionRepository,
  ) {}

  // Returns role templates from the deployment's app version snapshot, scoped to the org's business
  async getTemplates(orgId: string): Promise<RoleTemplateListResponseDto> {
    const { org, deployment } = await this.coreDeploymentService.resolveOrgDeployment(orgId);

    if (!deployment.version) {
      throw new NotFoundException('No app version linked to this deployment.');
    }
    const appVersion = await this.coreVersionRepository.findByVersion(deployment.version);
    if (!appVersion?.snapshot) {
      throw new NotFoundException('No snapshot available for this deployment.');
    }

    const snapshot = appVersion.snapshot as Record<string, unknown>;
    const businesses = (snapshot.businesses ?? {}) as Record<
      string,
      { roleTemplates: RoleTemplateListResponseDto['result'] }
    >;
    const roleTemplates = businesses[org.businessCode]?.roleTemplates ?? [];

    this.logger.log(`Fetched ${roleTemplates.length} role templates for org ${orgId}`);
    return { result: roleTemplates };
  }

  // Lists all roles for the organization from core
  async listRoles(orgId: string): Promise<CoreRole[]> {
    const { org, deployment } = await this.coreDeploymentService.resolveOrgDeployment(orgId);

    const roles = await this.coreRoleService.getOrgRoles(deployment.url, deployment.webhookSecret, org.orgIdentifier);
    this.logger.log(`Fetched roles for org ${orgId}`);
    return roles;
  }

  // Creates a new role in core for the organization
  async createRole(orgId: string, data: Record<string, unknown>): Promise<CreateResponseDto<CoreRole>> {
    const { org, deployment } = await this.coreDeploymentService.resolveOrgDeployment(orgId);

    const result = await this.coreRoleService.createOrgRole(
      deployment.url,
      deployment.webhookSecret,
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
      deployment.webhookSecret,
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
      deployment.webhookSecret,
      org.orgIdentifier,
      roleId,
    );
    this.logger.log(`Deleted role ${roleId} for org ${orgId}`);
    return result;
  }
}
