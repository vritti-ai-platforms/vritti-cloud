import { Injectable, Logger } from '@nestjs/common';
import { ForbiddenException, NotFoundException, ServiceUnavailableException } from '@vritti/api-sdk';
import type { Deployment, Organization } from '@/db/schema';
import { PlanRepository } from '@domain/plan/repositories/plan.repository';
import { CoreBusinessUnitService } from '@/modules/core-server/services/core-business-unit.service';
import { CoreDeploymentService } from '@/modules/core-server/services/core-deployment.service';

@Injectable()
export class OrganizationBusinessUnitsService {
  private readonly logger = new Logger(OrganizationBusinessUnitsService.name);

  constructor(
    private readonly coreDeploymentService: CoreDeploymentService,
    private readonly planRepository: PlanRepository,
    private readonly coreBusinessUnitService: CoreBusinessUnitService,
  ) {}

  // Lists all business units for the organization from core
  async listBusinessUnits(orgId: string): Promise<any[]> {
    const { org, deployment } = await this.coreDeploymentService.resolveOrgDeployment(orgId);

    try {
      const businessUnits = await this.coreBusinessUnitService.getBusinessUnits(
        deployment.url,
        deployment.webhookSecret,
        org.orgIdentifier,
      );
      this.logger.log(`Fetched business units for org ${orgId}`);
      return businessUnits;
    } catch (error: any) {
      this.logger.error(`Failed to fetch business units for org ${orgId}: ${error}`);
      throw new ServiceUnavailableException({
        label: 'Deployment Unreachable',
        detail: 'Unable to reach the deployment to fetch business units. Please try again later.',
      });
    }
  }

  // Creates a new business unit in core after checking plan limits
  async createBusinessUnit(orgId: string, data: Record<string, unknown>): Promise<any> {
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
    } catch (error: any) {
      this.logger.error(`Failed to create business unit for org ${orgId}: ${error}`);
      throw new ServiceUnavailableException({
        label: 'Deployment Unreachable',
        detail: 'Unable to reach the deployment to create the business unit. Please try again later.',
      });
    }
  }

  // Fetches a single business unit from core
  async getBusinessUnit(orgId: string, buId: string): Promise<any> {
    const { deployment } = await this.coreDeploymentService.resolveOrgDeployment(orgId);

    try {
      const result = await this.coreBusinessUnitService.getBusinessUnit(
        deployment.url,
        deployment.webhookSecret,
        buId,
      );
      this.logger.log(`Fetched business unit ${buId} for org ${orgId}`);
      return result;
    } catch (error: any) {
      this.logger.error(`Failed to fetch business unit ${buId} for org ${orgId}: ${error}`);
      throw new ServiceUnavailableException({
        label: 'Deployment Unreachable',
        detail: 'Unable to reach the deployment to fetch the business unit. Please try again later.',
      });
    }
  }

  // Updates a business unit in core
  async updateBusinessUnit(orgId: string, buId: string, data: Record<string, unknown>): Promise<any> {
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
    } catch (error: any) {
      this.logger.error(`Failed to update business unit ${buId} for org ${orgId}: ${error}`);
      throw new ServiceUnavailableException({
        label: 'Deployment Unreachable',
        detail: 'Unable to reach the deployment to update the business unit. Please try again later.',
      });
    }
  }

  // Deletes a business unit in core
  async deleteBusinessUnit(orgId: string, buId: string): Promise<any> {
    const { deployment } = await this.coreDeploymentService.resolveOrgDeployment(orgId);

    try {
      const result = await this.coreBusinessUnitService.deleteBusinessUnit(
        deployment.url,
        deployment.webhookSecret,
        buId,
      );
      this.logger.log(`Deleted business unit ${buId} for org ${orgId}`);
      return result;
    } catch (error: any) {
      this.logger.error(`Failed to delete business unit ${buId} for org ${orgId}: ${error}`);
      throw new ServiceUnavailableException({
        label: 'Deployment Unreachable',
        detail: 'Unable to reach the deployment to delete the business unit. Please try again later.',
      });
    }
  }

  // Lists role assignments for a business unit
  async getRoleAssignments(orgId: string, buId: string): Promise<any[]> {
    const { deployment } = await this.coreDeploymentService.resolveOrgDeployment(orgId);

    try {
      return await this.coreBusinessUnitService.getRoleAssignments(deployment.url, deployment.webhookSecret, buId);
    } catch (error: any) {
      this.logger.error(`Failed to fetch role assignments for BU ${buId}: ${error}`);
      throw new ServiceUnavailableException({
        label: 'Deployment Unreachable',
        detail: 'Unable to reach the deployment to fetch role assignments.',
      });
    }
  }

  // Assigns a role to a user at a business unit
  async assignRole(orgId: string, buId: string, data: { userId: string; orgRoleId: string }): Promise<any> {
    const { deployment } = await this.coreDeploymentService.resolveOrgDeployment(orgId);

    try {
      return await this.coreBusinessUnitService.assignRole(
        deployment.url,
        deployment.webhookSecret,
        data.userId,
        { orgRoleId: data.orgRoleId, businessUnitId: buId },
      );
    } catch (error: any) {
      this.logger.error(`Failed to assign role at BU ${buId}: ${error}`);
      throw new ServiceUnavailableException({
        label: 'Deployment Unreachable',
        detail: 'Unable to reach the deployment to assign the role.',
      });
    }
  }

  // Removes a role assignment
  async removeRoleAssignment(orgId: string, assignmentId: string): Promise<any> {
    const { deployment } = await this.coreDeploymentService.resolveOrgDeployment(orgId);

    try {
      // Core-server DELETE /users/webhook/:userId/roles/:assignmentId — userId is ignored, only assignmentId matters
      return await this.coreBusinessUnitService.removeRoleAssignment(
        deployment.url,
        deployment.webhookSecret,
        '_',
        assignmentId,
      );
    } catch (error: any) {
      this.logger.error(`Failed to remove role assignment ${assignmentId}: ${error}`);
      throw new ServiceUnavailableException({
        label: 'Deployment Unreachable',
        detail: 'Unable to reach the deployment to remove the role assignment.',
      });
    }
  }

  // Extracts location fields into metadata for core-server
  private packMetadata(data: Record<string, unknown>): Record<string, unknown> {
    const { address, city, state, country, timezone, phone, ...rest } = data;
    const metadata: Record<string, unknown> = {};
    if (address) metadata.address = address;
    if (city) metadata.city = city;
    if (state) metadata.state = state;
    if (country) metadata.country = country;
    if (timezone) metadata.timezone = timezone;
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
    } catch (error: any) {
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
