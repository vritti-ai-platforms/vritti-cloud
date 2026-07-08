import { buildBuMatrix } from '@domain/catalog/bu-matrix.builder';
import type { BuFeatureLocks } from '@domain/catalog/catalog.builder';
import { OrganizationRepository } from '@domain/cloud-organization/repositories/organization.repository';
import type { SnapshotPlan, VersionSnapshot } from '@domain/version/root/services/version-snapshot.builder';
import { Injectable, Logger } from '@nestjs/common';
import { BadRequestException, ForbiddenException, NotFoundException, type SuccessResponseDto } from '@vritti/api-sdk';
import { PLATFORMS } from '@vritti/api-sdk/catalog-resolver';
import type { Deployment, Organization } from '@/db/schema';
import { CoreVersionRepository } from '@/modules/core-server/repositories/core-version.repository';
import { CatalogSyncService } from '@/modules/core-server/services/catalog-sync.service';
import { CoreBusinessUnitService } from '@/modules/core-server/services/core-business-unit.service';
import { CoreDeploymentService } from '@/modules/core-server/services/core-deployment.service';
import { CoreRoleService } from '@/modules/core-server/services/core-role.service';
import { requireSigningKey } from '@/modules/core-server/signing-key.util';
import type { SetBuLocksDto } from '../dto/request/set-bu-locks.dto';
import type { BuMatrixResponseDto } from '../dto/response/bu-matrix.response.dto';
import type { BuRoleAssignment, CoreBusinessUnit, CoreRole } from '../types';

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
      requireSigningKey(deployment),
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
      requireSigningKey(deployment),
      org.orgIdentifier,
      this.packMetadata(data),
    );
    // Seed the org's role templates (idempotent); a new BU has no lock overlay and resolves from the deployment catalog
    await this.catalogSyncService.syncRoles(orgId);
    this.logger.log(`Created business unit for org ${orgId}`);
    return result;
  }

  // Fetches a single business unit from core (returns subtree)
  async getBusinessUnit(orgId: string, buId: string): Promise<CoreBusinessUnit | null> {
    const { org, deployment } = await this.coreDeploymentService.resolveOrgDeployment(orgId);

    const result = await this.coreBusinessUnitService.getBusinessUnit(
      deployment.url,
      requireSigningKey(deployment),
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
      requireSigningKey(deployment),
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
      requireSigningKey(deployment),
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
      requireSigningKey(deployment),
      org.orgIdentifier,
      buId,
    );
  }

  // Assigns a role to a user at a business unit
  async assignRole(orgId: string, buId: string, data: { userId: string; roleId: string }): Promise<SuccessResponseDto> {
    const { org, deployment } = await this.coreDeploymentService.resolveOrgDeployment(orgId);

    return this.coreBusinessUnitService.assignRole(
      deployment.url,
      requireSigningKey(deployment),
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
      requireSigningKey(deployment),
      org.orgIdentifier,
      '_',
      assignmentId,
    );
  }

  // Returns the BU permission matrix from the version snapshot plus the raw stored deny-list so the editor seeds faithfully
  async getBuMatrix(orgId: string, buId: string): Promise<BuMatrixResponseDto> {
    const { org, deployment } = await this.coreDeploymentService.resolveOrgDeployment(orgId);
    const { snapshot } = await this.loadPlanContext(org, deployment);
    return buildBuMatrix(snapshot, org.businessCode, org.planCode, org.buLocks?.[buId]);
  }

  // Replaces the BU's lock deny-list and pushes the overlay to core (plan stays the ceiling, so an out-of-plan lock is inert)
  async updateBuLocks(orgId: string, buId: string, dto: SetBuLocksDto): Promise<SuccessResponseDto> {
    const { org } = await this.coreDeploymentService.resolveOrgDeployment(orgId);

    const buLocks = { ...(org.buLocks ?? {}) };
    buLocks[buId] = this.validateLocksShape(dto.locks);
    await this.organizationRepository.update(orgId, { buLocks });

    // Push the BU's lock overlay so the new locks take effect on the next resolution in core
    await this.catalogSyncService.syncBuLocks(orgId, buId);
    this.logger.log(`Updated locks for BU ${buId} in org ${orgId}`);
    return { success: true, message: 'Business unit permissions updated successfully.' };
  }

  // Lightly validates the deny-list shape: featureCode → { web?/mobile?: null | string[] }
  private validateLocksShape(locks: BuFeatureLocks | undefined): BuFeatureLocks {
    const result: BuFeatureLocks = {};
    for (const [featureCode, entry] of Object.entries(locks ?? {})) {
      if (typeof entry !== 'object' || entry === null || Array.isArray(entry)) {
        throw new BadRequestException('Each lock entry must map web/mobile to null or a list of permission codes.');
      }
      const cleaned: BuFeatureLocks[string] = {};
      for (const platform of PLATFORMS) {
        const value = entry[platform];
        if (value === undefined) continue;
        if (value !== null && !(Array.isArray(value) && value.every((code) => typeof code === 'string'))) {
          throw new BadRequestException('Each lock entry must map web/mobile to null or a list of permission codes.');
        }
        cleaned[platform] = value;
      }
      result[featureCode] = cleaned;
    }
    return result;
  }

  // Returns roles compatible with a business unit's assigned apps
  async getCompatibleRoles(orgId: string, buId: string): Promise<CoreRole[]> {
    const { org, deployment } = await this.coreDeploymentService.resolveOrgDeployment(orgId);

    return this.coreRoleService.getCompatibleRoles(
      deployment.url,
      requireSigningKey(deployment),
      org.orgIdentifier,
      buId,
    );
  }

  // Loads the org's version snapshot + its plan (the ceiling BU locks live within); throws NotFound if either is missing
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
      requireSigningKey(deployment),
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
