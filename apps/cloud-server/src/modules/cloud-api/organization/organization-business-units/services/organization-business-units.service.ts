import { buildBuMatrix } from '@domain/catalog/bu-matrix.builder';
import { OrganizationRepository } from '@domain/cloud-organization/repositories/organization.repository';
import type { SnapshotPlan, VersionSnapshot } from '@domain/version/root/services/version-snapshot.builder';
import { Injectable, Logger } from '@nestjs/common';
import {
  ForbiddenException,
  NotFoundException,
  ServiceUnavailableException,
  type SuccessResponseDto,
} from '@vritti/api-sdk';
import type { BuUnlocks, Deployment, Organization } from '@/db/schema';
import { CoreVersionRepository } from '@/modules/core-server/repositories/core-version.repository';
import { CatalogSyncService } from '@/modules/core-server/services/catalog-sync.service';
import { CoreBusinessUnitService } from '@/modules/core-server/services/core-business-unit.service';
import { CoreDeploymentService } from '@/modules/core-server/services/core-deployment.service';
import { CoreRoleService } from '@/modules/core-server/services/core-role.service';
import type { SetBuUnlocksDto } from '../dto/request/set-bu-unlocks.dto';
import type { BuMatrixResponseDto } from '../dto/response/bu-matrix.response.dto';
import type { BuRoleAssignment, CoreBusinessUnit, CoreRole } from '../types';

// UI platform keys (snapshot microfrontend keys), used when clamping BU unlocks to the plan ceiling
const PLATFORMS = ['web', 'mobile'] as const;

@Injectable()
export class OrganizationBusinessUnitsService {
  private readonly logger = new Logger(OrganizationBusinessUnitsService.name);

  constructor(
    private readonly coreDeploymentService: CoreDeploymentService,
    private readonly organizationRepository: OrganizationRepository,
    private readonly coreVersionRepository: CoreVersionRepository,
    private readonly coreBusinessUnitService: CoreBusinessUnitService,
    private readonly catalogSyncService: CatalogSyncService,
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
      // Seed the org's role templates (idempotent — core skips already-provisioned ones)
      await this.catalogSyncService.syncRoles(orgId);
      // Seed the new BU's snapshot — with no BU locks yet it inherits the full plan
      await this.catalogSyncService.syncBuSnapshot(orgId, result.id);
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
    const { org, deployment } = await this.coreDeploymentService.resolveOrgDeployment(orgId);

    try {
      const result = await this.coreBusinessUnitService.getBusinessUnit(
        deployment.url,
        deployment.webhookSecret,
        org.orgIdentifier,
        buId,
      );
      this.logger.log(`Fetched business unit ${buId} for org ${orgId}`);
      // Pick the requested BU explicitly — findSubtree returns the BU plus descendants in unspecified order
      const list = Array.isArray(result) ? result : [result];
      return list.find((bu) => bu?.id === buId) ?? list[0] ?? null;
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
    const { org, deployment } = await this.coreDeploymentService.resolveOrgDeployment(orgId);

    try {
      const { parentId: _parentId, ...updateData } = this.packMetadata(data);
      const result = await this.coreBusinessUnitService.updateBusinessUnit(
        deployment.url,
        deployment.webhookSecret,
        org.orgIdentifier,
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
    const { org, deployment } = await this.coreDeploymentService.resolveOrgDeployment(orgId);

    try {
      const result = await this.coreBusinessUnitService.deleteBusinessUnit(
        deployment.url,
        deployment.webhookSecret,
        org.orgIdentifier,
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
    const { org, deployment } = await this.coreDeploymentService.resolveOrgDeployment(orgId);

    try {
      return await this.coreBusinessUnitService.getRoleAssignments(
        deployment.url,
        deployment.webhookSecret,
        org.orgIdentifier,
        buId,
      );
    } catch (error: unknown) {
      this.logger.error(`Failed to fetch role assignments for BU ${buId}: ${error}`);
      throw new ServiceUnavailableException({
        label: 'Deployment Unreachable',
        detail: 'Unable to reach the deployment to fetch role assignments.',
      });
    }
  }

  // Assigns a role to a user at a business unit
  async assignRole(
    orgId: string,
    buId: string,
    data: { userId: string; orgRoleId: string },
  ): Promise<SuccessResponseDto> {
    const { org, deployment } = await this.coreDeploymentService.resolveOrgDeployment(orgId);

    try {
      return await this.coreBusinessUnitService.assignRole(
        deployment.url,
        deployment.webhookSecret,
        org.orgIdentifier,
        data.userId,
        {
          orgRoleId: data.orgRoleId,
          businessUnitId: buId,
        },
      );
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
    const { org, deployment } = await this.coreDeploymentService.resolveOrgDeployment(orgId);

    try {
      // Core-server DELETE /users/webhook/:userId/roles/:assignmentId — userId is ignored, only assignmentId matters
      return await this.coreBusinessUnitService.removeRoleAssignment(
        deployment.url,
        deployment.webhookSecret,
        org.orgIdentifier,
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

  // Returns the BU permission matrix — built purely from the version snapshot (all apps/features/permissions, with
  // per-platform inPlan/selected/availableIn). No catalog-table reads.
  async getBuMatrix(orgId: string, buId: string): Promise<BuMatrixResponseDto> {
    const { org, deployment } = await this.coreDeploymentService.resolveOrgDeployment(orgId);
    const { snapshot } = await this.loadPlanContext(org, deployment);
    return buildBuMatrix(snapshot, org.businessCode, org.planCode, org.buUnlocks?.[buId]);
  }

  // Replaces the BU's unlock allow-list (clamped to the plan ceiling) and re-pushes the recomputed catalog to core
  async updateBuLocks(orgId: string, buId: string, dto: SetBuUnlocksDto): Promise<SuccessResponseDto> {
    const { org, deployment } = await this.coreDeploymentService.resolveOrgDeployment(orgId);
    const { plan } = await this.loadPlanContext(org, deployment);

    // Clamp each requested code to the plan ceiling — a BU can never unlock more than its plan
    const clamped: BuUnlocks[string] = {};
    for (const [featureCode, platforms] of Object.entries(dto.unlocks ?? {})) {
      const planEntry = plan.unlockedPermissions?.[featureCode];
      if (!planEntry) continue;
      const entry: { web?: string[]; mobile?: string[] } = {};
      for (const platform of PLATFORMS) {
        const requested = platforms?.[platform];
        if (requested === undefined) continue;
        const ceiling = new Set(planEntry[platform] ?? []);
        entry[platform] = requested.filter((code) => ceiling.has(code));
      }
      if (entry.web !== undefined || entry.mobile !== undefined) clamped[featureCode] = entry;
    }

    // Always store explicitly once edited — an empty allow-list means "lock everything", NOT "inherit the plan"
    const buUnlocks = { ...(org.buUnlocks ?? {}) };
    buUnlocks[buId] = clamped;
    await this.organizationRepository.update(orgId, { buUnlocks });

    // Re-push the BU snapshot so the new locks take effect downstream (per-user resolution reads it)
    try {
      await this.catalogSyncService.syncBuSnapshot(orgId, buId);
      this.logger.log(`Updated locks for BU ${buId} in org ${orgId}`);
      return { success: true, message: 'Business unit permissions updated successfully.' };
    } catch (error: unknown) {
      this.logger.error(`Failed to sync locks for BU ${buId} in org ${orgId}: ${error}`);
      throw new ServiceUnavailableException({
        label: 'Deployment Unreachable',
        detail: 'Unable to reach the deployment to update business unit permissions.',
      });
    }
  }

  // Returns roles compatible with a business unit's assigned apps
  async getCompatibleRoles(orgId: string, buId: string): Promise<CoreRole[]> {
    const { org, deployment } = await this.coreDeploymentService.resolveOrgDeployment(orgId);

    try {
      return await this.coreRoleService.getCompatibleRoles(
        deployment.url,
        deployment.webhookSecret,
        org.orgIdentifier,
        buId,
      );
    } catch (error: unknown) {
      this.logger.error(`Failed to fetch compatible roles for BU ${buId}: ${error}`);
      throw new ServiceUnavailableException({
        label: 'Deployment Unreachable',
        detail: 'Unable to reach the deployment to fetch compatible roles.',
      });
    }
  }

  // Loads the org's version snapshot + its plan (from snapshot.businesses[businessCode].plans[planCode]).
  // The plan is the ceiling the BU's locks live within. Throws NotFound if the snapshot or plan is missing.
  private async loadPlanContext(
    org: Organization,
    deployment: Deployment,
  ): Promise<{ snapshot: VersionSnapshot; plan: SnapshotPlan }> {
    const appVersion = await this.coreVersionRepository.findByVersion(deployment.version);
    const snapshot = (appVersion?.snapshot as VersionSnapshot | null) ?? null;
    const plan = snapshot?.businesses?.[org.businessCode]?.plans?.[org.planCode];
    if (!snapshot || !plan) throw new NotFoundException('Plan not found.');
    return { snapshot, plan };
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
    const { plan } = await this.loadPlanContext(org, deployment);

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
