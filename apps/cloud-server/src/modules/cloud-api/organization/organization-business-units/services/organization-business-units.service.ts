import { buildBuMatrix } from '@domain/catalog/bu-matrix.builder';
import { OrganizationRepository } from '@domain/cloud-organization/repositories/organization.repository';
import type { SnapshotPlan, VersionSnapshot } from '@domain/version/root/services/version-snapshot.builder';
import { Injectable, Logger } from '@nestjs/common';
import { ForbiddenException, NotFoundException, type SuccessResponseDto } from '@vritti/api-sdk';
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

    const businessUnits = await this.coreBusinessUnitService.getBusinessUnits(
      deployment.url,
      deployment.webhookSecret,
      org.orgIdentifier,
    );
    this.logger.log(`Fetched business units for org ${orgId}`);
    return businessUnits;
  }

  // Creates a new business unit in core after checking plan limits
  async createBusinessUnit(orgId: string, data: Record<string, unknown>): Promise<CoreBusinessUnit> {
    const { org, deployment } = await this.coreDeploymentService.resolveOrgDeployment(orgId);

    // Check plan BU limits before creating
    await this.checkBusinessUnitLimit(org, deployment);

    const result = await this.coreBusinessUnitService.createBusinessUnit(
      deployment.url,
      deployment.webhookSecret,
      org.orgIdentifier,
      this.packMetadata(data),
    );
    // Seed the org's role templates (idempotent — core skips already-provisioned ones).
    // No catalog seeding needed — a new BU has no unlock overlay and resolves from the deployment catalog.
    await this.catalogSyncService.syncRoles(orgId);
    this.logger.log(`Created business unit for org ${orgId}`);
    return result;
  }

  // Fetches a single business unit from core (returns subtree)
  async getBusinessUnit(orgId: string, buId: string): Promise<CoreBusinessUnit | null> {
    const { org, deployment } = await this.coreDeploymentService.resolveOrgDeployment(orgId);

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
  }

  // Updates a business unit in core
  async updateBusinessUnit(orgId: string, buId: string, data: Record<string, unknown>): Promise<SuccessResponseDto> {
    const { org, deployment } = await this.coreDeploymentService.resolveOrgDeployment(orgId);

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
  }

  // Deletes a business unit in core
  async deleteBusinessUnit(orgId: string, buId: string): Promise<SuccessResponseDto> {
    const { org, deployment } = await this.coreDeploymentService.resolveOrgDeployment(orgId);

    const result = await this.coreBusinessUnitService.deleteBusinessUnit(
      deployment.url,
      deployment.webhookSecret,
      org.orgIdentifier,
      buId,
    );
    this.logger.log(`Deleted business unit ${buId} for org ${orgId}`);
    return result;
  }

  // Lists role assignments for a business unit
  async getRoleAssignments(orgId: string, buId: string): Promise<BuRoleAssignment[]> {
    const { org, deployment } = await this.coreDeploymentService.resolveOrgDeployment(orgId);

    return this.coreBusinessUnitService.getRoleAssignments(
      deployment.url,
      deployment.webhookSecret,
      org.orgIdentifier,
      buId,
    );
  }

  // Assigns a role to a user at a business unit
  async assignRole(orgId: string, buId: string, data: { userId: string; roleId: string }): Promise<SuccessResponseDto> {
    const { org, deployment } = await this.coreDeploymentService.resolveOrgDeployment(orgId);

    return this.coreBusinessUnitService.assignRole(
      deployment.url,
      deployment.webhookSecret,
      org.orgIdentifier,
      data.userId,
      {
        roleId: data.roleId,
        businessUnitId: buId,
      },
    );
  }

  // Removes a role assignment
  async removeRoleAssignment(orgId: string, assignmentId: string): Promise<SuccessResponseDto> {
    const { org, deployment } = await this.coreDeploymentService.resolveOrgDeployment(orgId);

    // Core-server DELETE /users/webhook/:userId/roles/:assignmentId — userId is ignored, only assignmentId matters
    return this.coreBusinessUnitService.removeRoleAssignment(
      deployment.url,
      deployment.webhookSecret,
      org.orgIdentifier,
      '_',
      assignmentId,
    );
  }

  // Returns the BU permission matrix — built purely from the version snapshot (all apps/features/permissions, with
  // per-platform inPlan/selected/availableIn). No catalog-table reads.
  async getBuMatrix(orgId: string, buId: string): Promise<BuMatrixResponseDto> {
    const { org, deployment } = await this.coreDeploymentService.resolveOrgDeployment(orgId);
    const { snapshot } = await this.loadPlanContext(org, deployment);
    return buildBuMatrix(snapshot, org.businessCode, org.planCode, org.buUnlocks?.[buId]);
  }

  // Replaces the BU's unlock allow-list (clamped to the plan ceiling) and pushes the overlay to core
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

    // Push the BU's unlock overlay so the new locks take effect on the next resolution in core
    await this.catalogSyncService.syncBuUnlocks(orgId, buId);
    this.logger.log(`Updated locks for BU ${buId} in org ${orgId}`);
    return { success: true, message: 'Business unit permissions updated successfully.' };
  }

  // Returns roles compatible with a business unit's assigned apps
  async getCompatibleRoles(orgId: string, buId: string): Promise<CoreRole[]> {
    const { org, deployment } = await this.coreDeploymentService.resolveOrgDeployment(orgId);

    return this.coreRoleService.getCompatibleRoles(deployment.url, deployment.webhookSecret, org.orgIdentifier, buId);
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

    const businessUnits = await this.coreBusinessUnitService.getBusinessUnits(
      deployment.url,
      deployment.webhookSecret,
      org.orgIdentifier,
    );
    const currentCount = Array.isArray(businessUnits) ? businessUnits.length : 0;

    if (currentCount >= plan.maxBusinessUnits) {
      throw new ForbiddenException({
        label: 'Business Unit Limit Reached',
        detail: `Your plan allows a maximum of ${plan.maxBusinessUnits} business units. Please upgrade to create more.`,
      });
    }
  }
}
