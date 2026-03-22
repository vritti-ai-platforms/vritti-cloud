import { Injectable, Logger } from '@nestjs/common';
import { NotFoundException, ServiceUnavailableException } from '@vritti/api-sdk';
import { CoreAppVersionRepository } from '@/modules/core-server/repositories/core-app-version.repository';
import { CoreDeploymentService } from '@/modules/core-server/services/core-deployment.service';
import { CoreRoleService } from '@/modules/core-server/services/core-role.service';
import type { RoleTemplateListResponseDto } from '../dto/response/role-template.response.dto';

@Injectable()
export class OrganizationRolesService {
  private readonly logger = new Logger(OrganizationRolesService.name);

  constructor(
    private readonly coreDeploymentService: CoreDeploymentService,
    private readonly coreRoleService: CoreRoleService,
    private readonly coreAppVersionRepository: CoreAppVersionRepository,
  ) {}

  // Returns role templates from the deployment's app version snapshot
  async getTemplates(orgId: string): Promise<RoleTemplateListResponseDto> {
    const { deployment } = await this.coreDeploymentService.resolveOrgDeployment(orgId);

    const appVersion = await this.coreAppVersionRepository.findById(deployment.appVersionId);
    if (!appVersion?.snapshot) {
      throw new NotFoundException('No snapshot available for this deployment.');
    }

    const snapshot = appVersion.snapshot as Record<string, unknown>;
    const roleTemplates = (snapshot.roleTemplates ?? []) as RoleTemplateListResponseDto['result'];

    this.logger.log(`Fetched ${roleTemplates.length} role templates for org ${orgId}`);
    return { result: roleTemplates };
  }

  // Lists all roles for the organization from core
  async listRoles(orgId: string): Promise<any[]> {
    const { org, deployment } = await this.coreDeploymentService.resolveOrgDeployment(orgId);

    try {
      const roles = await this.coreRoleService.getOrgRoles(
        deployment.url,
        deployment.webhookSecret,
        org.orgIdentifier,
      );
      this.logger.log(`Fetched roles for org ${orgId}`);
      return roles;
    } catch (error: any) {
      this.logger.error(`Failed to fetch roles for org ${orgId}: ${error}`);
      throw new ServiceUnavailableException({
        label: 'Deployment Unreachable',
        detail: 'Unable to reach the deployment to fetch roles. Please try again later.',
      });
    }
  }

  // Creates a new role in core for the organization
  async createRole(orgId: string, data: Record<string, unknown>): Promise<any> {
    const { org, deployment } = await this.coreDeploymentService.resolveOrgDeployment(orgId);

    try {
      const result = await this.coreRoleService.createOrgRole(
        deployment.url,
        deployment.webhookSecret,
        org.orgIdentifier,
        data,
      );
      this.logger.log(`Created role for org ${orgId}`);
      return result;
    } catch (error: any) {
      this.logger.error(`Failed to create role for org ${orgId}: ${error}`);
      throw new ServiceUnavailableException({
        label: 'Deployment Unreachable',
        detail: 'Unable to reach the deployment to create the role. Please try again later.',
      });
    }
  }

  // Updates a role in core
  async updateRole(orgId: string, roleId: string, data: Record<string, unknown>): Promise<any> {
    const { deployment } = await this.coreDeploymentService.resolveOrgDeployment(orgId);

    try {
      const result = await this.coreRoleService.updateOrgRole(
        deployment.url,
        deployment.webhookSecret,
        roleId,
        data,
      );
      this.logger.log(`Updated role ${roleId} for org ${orgId}`);
      return result;
    } catch (error: any) {
      this.logger.error(`Failed to update role ${roleId} for org ${orgId}: ${error}`);
      throw new ServiceUnavailableException({
        label: 'Deployment Unreachable',
        detail: 'Unable to reach the deployment to update the role. Please try again later.',
      });
    }
  }

  // Deletes a role in core
  async deleteRole(orgId: string, roleId: string): Promise<any> {
    const { deployment } = await this.coreDeploymentService.resolveOrgDeployment(orgId);

    try {
      const result = await this.coreRoleService.deleteOrgRole(
        deployment.url,
        deployment.webhookSecret,
        roleId,
      );
      this.logger.log(`Deleted role ${roleId} for org ${orgId}`);
      return result;
    } catch (error: any) {
      const responseData = error?.response?.data;
      this.logger.error(
        `Failed to delete role ${roleId} for org ${orgId}: ${error}`,
        responseData ? JSON.stringify(responseData) : undefined,
      );
      throw new ServiceUnavailableException({
        label: responseData?.title ?? 'Deployment Unreachable',
        detail: responseData?.detail ?? 'Unable to reach the deployment to delete the role. Please try again later.',
      });
    }
  }
}
