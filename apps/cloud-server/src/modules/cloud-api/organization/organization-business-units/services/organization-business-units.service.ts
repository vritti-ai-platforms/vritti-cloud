import { OrganizationRepository } from '@domain/cloud-organization/repositories/organization.repository';
import { PlanRepository } from '@domain/plan/repositories/plan.repository';
import { Injectable, Logger } from '@nestjs/common';
import { ForbiddenException, NotFoundException, ServiceUnavailableException, type SuccessResponseDto } from '@vritti/api-sdk';
import type { Deployment, Organization } from '@/db/schema';
import { CoreBusinessUnitService } from '@/modules/core-server/services/core-business-unit.service';
import { CoreConfigService } from '@/modules/core-server/services/core-config.service';
import { CoreDeploymentService } from '@/modules/core-server/services/core-deployment.service';
import { CoreRoleService } from '@/modules/core-server/services/core-role.service';
import type { BuRoleAssignment, CoreBusinessUnit, CoreOrgRole } from '../types';

@Injectable()
export class OrganizationBusinessUnitsService {
  private readonly logger = new Logger(OrganizationBusinessUnitsService.name);

  constructor(
    private readonly coreDeploymentService: CoreDeploymentService,
    private readonly organizationRepository: OrganizationRepository,
    private readonly planRepository: PlanRepository,
    private readonly coreBusinessUnitService: CoreBusinessUnitService,
    private readonly coreConfigService: CoreConfigService,
    private readonly coreRoleService: CoreRoleService,
  ) {}

  // Lists all business units for the organization from core
  async listBusinessUnits(orgId: string): Promise<CoreBusinessUnit[]> {
    const { org, deployment } = await this.coreDeploymentService.resolveOrgDeployment(orgId);

    try {
      const businessUnits = await this.coreBusinessUnitService.getBusinessUnits(
        deployment.url,
        deployment.webhookSecret,
        org.orgIdentifier,
      );
      this.logger.log(`Fetched business units for org ${orgId}`);
      return businessUnits;
    } catch (error: unknown) {
      this.logger.error(`Failed to fetch business units for org ${orgId}: ${error}`);
      throw new ServiceUnavailableException({
        label: 'Deployment Unreachable',
        detail: 'Unable to reach the deployment to fetch business units. Please try again later.',
      });
    }
  }

  // Creates a new business unit in core after checking plan limits
  async createBusinessUnit(orgId: string, data: Record<string, unknown>): Promise<CoreBusinessUnit> {
    const { org, deployment } = await this.coreDeploymentService.resolveOrgDeployment(orgId);

    // Check plan BU limits before creating
    await this.checkBusinessUnitLimit(org, deployment);

    try {
      const result = await this.coreBusinessUnitService.createBusinessUnit(
        deployment.url,
        deployment.webhookSecret,
        org.orgIdentifier,
        this.packMetadata(data),
      );
      this.logger.log(`Created business unit for org ${orgId}`);
      return result;
    } catch (error: unknown) {
      this.logger.error(`Failed to create business unit for org ${orgId}: ${error}`);
      throw new ServiceUnavailableException({
        label: 'Deployment Unreachable',
        detail: 'Unable to reach the deployment to create the business unit. Please try again later.',
      });
    }
  }

  // Fetches a single business unit from core (returns subtree)
  async getBusinessUnit(orgId: string, buId: string): Promise<CoreBusinessUnit | null> {
    const { deployment } = await this.coreDeploymentService.resolveOrgDeployment(orgId);

    try {
      const result = await this.coreBusinessUnitService.getBusinessUnit(deployment.url, deployment.webhookSecret, buId);
      this.logger.log(`Fetched business unit ${buId} for org ${orgId}`);
      return Array.isArray(result) ? (result[0] ?? null) : result;
    } catch (error: unknown) {
      this.logger.error(`Failed to fetch business unit ${buId} for org ${orgId}: ${error}`);
      throw new ServiceUnavailableException({
        label: 'Deployment Unreachable',
        detail: 'Unable to reach the deployment to fetch the business unit. Please try again later.',
      });
    }
  }

  // Updates a business unit in core
  async updateBusinessUnit(orgId: string, buId: string, data: Record<string, unknown>): Promise<SuccessResponseDto> {
    const { deployment } = await this.coreDeploymentService.resolveOrgDeployment(orgId);

    try {
      const { parentId: _parentId, ...updateData } = this.packMetadata(data);
      const result = await this.coreBusinessUnitService.updateBusinessUnit(
        deployment.url,
        deployment.webhookSecret,
        buId,
        updateData,
      );
      this.logger.log(`Updated business unit ${buId} for org ${orgId}`);
      return result;
    } catch (error: unknown) {
      this.logger.error(`Failed to update business unit ${buId} for org ${orgId}: ${error}`);
      throw new ServiceUnavailableException({
        label: 'Deployment Unreachable',
        detail: 'Unable to reach the deployment to update the business unit. Please try again later.',
      });
    }
  }

  // Deletes a business unit in core
  async deleteBusinessUnit(orgId: string, buId: string): Promise<SuccessResponseDto> {
    const { deployment } = await this.coreDeploymentService.resolveOrgDeployment(orgId);

    try {
      const result = await this.coreBusinessUnitService.deleteBusinessUnit(
        deployment.url,
        deployment.webhookSecret,
        buId,
      );
      this.logger.log(`Deleted business unit ${buId} for org ${orgId}`);
      return result;
    } catch (error: unknown) {
      this.logger.error(`Failed to delete business unit ${buId} for org ${orgId}: ${error}`);
      throw new ServiceUnavailableException({
        label: 'Deployment Unreachable',
        detail: 'Unable to reach the deployment to delete the business unit. Please try again later.',
      });
    }
  }

  // Lists role assignments for a business unit
  async getRoleAssignments(orgId: string, buId: string): Promise<BuRoleAssignment[]> {
    const { deployment } = await this.coreDeploymentService.resolveOrgDeployment(orgId);

    try {
      return await this.coreBusinessUnitService.getRoleAssignments(deployment.url, deployment.webhookSecret, buId);
    } catch (error: unknown) {
      this.logger.error(`Failed to fetch role assignments for BU ${buId}: ${error}`);
      throw new ServiceUnavailableException({
        label: 'Deployment Unreachable',
        detail: 'Unable to reach the deployment to fetch role assignments.',
      });
    }
  }

  // Assigns a role to a user at a business unit
  async assignRole(orgId: string, buId: string, data: { userId: string; orgRoleId: string }): Promise<SuccessResponseDto> {
    const { deployment } = await this.coreDeploymentService.resolveOrgDeployment(orgId);

    try {
      return await this.coreBusinessUnitService.assignRole(deployment.url, deployment.webhookSecret, data.userId, {
        orgRoleId: data.orgRoleId,
        businessUnitId: buId,
      });
    } catch (error: unknown) {
      this.logger.error(`Failed to assign role at BU ${buId}: ${error}`);
      throw new ServiceUnavailableException({
        label: 'Deployment Unreachable',
        detail: 'Unable to reach the deployment to assign the role.',
      });
    }
  }

  // Removes a role assignment
  async removeRoleAssignment(orgId: string, assignmentId: string): Promise<SuccessResponseDto> {
    const { deployment } = await this.coreDeploymentService.resolveOrgDeployment(orgId);

    try {
      // Core-server DELETE /users/webhook/:userId/roles/:assignmentId — userId is ignored, only assignmentId matters
      return await this.coreBusinessUnitService.removeRoleAssignment(
        deployment.url,
        deployment.webhookSecret,
        '_',
        assignmentId,
      );
    } catch (error: unknown) {
      this.logger.error(`Failed to remove role assignment ${assignmentId}: ${error}`);
      throw new ServiceUnavailableException({
        label: 'Deployment Unreachable',
        detail: 'Unable to reach the deployment to remove the role assignment.',
      });
    }
  }

  // Updates the assigned apps for a business unit and invalidates the config cache
  async updateBuApps(orgId: string, buId: string, appCodes: string[]): Promise<SuccessResponseDto> {
    const { org, deployment } = await this.coreDeploymentService.resolveOrgDeployment(orgId);

    // Persist BU app assignment on cloud for license config endpoint
    const assignments = (org.buAppAssignments ?? {}) as Record<string, string[]>;
    if (appCodes.length > 0) {
      assignments[buId] = appCodes;
    } else {
      delete assignments[buId];
    }
    await this.organizationRepository.update(orgId, { buAppAssignments: assignments });

    try {
      const result = await this.coreBusinessUnitService.updateBuApps(deployment.url, deployment.webhookSecret, buId, {
        appCodes,
      });
      // Invalidate config cache so core-server fetches fresh catalogs
      await this.coreConfigService.invalidateOrg(deployment.url, deployment.webhookSecret, org.orgIdentifier);
      this.logger.log(`Updated apps for BU ${buId} in org ${orgId}: [${appCodes.join(', ')}]`);
      return result;
    } catch (error: unknown) {
      this.logger.error(`Failed to update apps for BU ${buId} in org ${orgId}: ${error}`);
      throw new ServiceUnavailableException({
        label: 'Deployment Unreachable',
        detail: 'Unable to reach the deployment to update business unit apps.',
      });
    }
  }

  // Returns roles compatible with a business unit's assigned apps
  async getCompatibleRoles(orgId: string, buId: string): Promise<CoreOrgRole[]> {
    const { deployment } = await this.coreDeploymentService.resolveOrgDeployment(orgId);

    try {
      return await this.coreRoleService.getCompatibleRoles(deployment.url, deployment.webhookSecret, buId);
    } catch (error: unknown) {
      this.logger.error(`Failed to fetch compatible roles for BU ${buId}: ${error}`);
      throw new ServiceUnavailableException({
        label: 'Deployment Unreachable',
        detail: 'Unable to reach the deployment to fetch compatible roles.',
      });
    }
  }

  // Extracts location fields into metadata for core-server while keeping timezone as a top-level BU field
  private packMetadata(data: Record<string, unknown>): Record<string, unknown> {
    const { address, city, state, country, phone, ...rest } = data;
    const metadata: Record<string, unknown> = {};
    if (address) metadata.address = address;
    if (city) metadata.city = city;
    if (state) metadata.state = state;
    if (country) metadata.country = country;
    if (phone) metadata.phone = phone;

    return Object.keys(metadata).length > 0 ? { ...rest, metadata } : rest;
  }

  // Checks if the organization has reached its plan's max business unit limit
  private async checkBusinessUnitLimit(org: Organization, deployment: Deployment): Promise<void> {
    const plan = await this.planRepository.findById(org.planId);
    if (!plan) throw new NotFoundException('Plan not found.');

    // null maxBusinessUnits means unlimited
    if (plan.maxBusinessUnits === null) return;

    let currentCount: number;
    try {
      const businessUnits = await this.coreBusinessUnitService.getBusinessUnits(
        deployment.url,
        deployment.webhookSecret,
        org.orgIdentifier,
      );
      currentCount = Array.isArray(businessUnits) ? businessUnits.length : 0;
    } catch (error: unknown) {
      this.logger.error(`Failed to fetch BU count for limit check in org ${org.id}: ${error}`);
      throw new ServiceUnavailableException({
        label: 'Deployment Unreachable',
        detail: 'Unable to verify business unit limits. Please try again later.',
      });
    }

    if (currentCount >= plan.maxBusinessUnits) {
      throw new ForbiddenException({
        label: 'Business Unit Limit Reached',
        detail: `Your plan allows a maximum of ${plan.maxBusinessUnits} business units. Please upgrade to create more.`,
      });
    }
  }
}
