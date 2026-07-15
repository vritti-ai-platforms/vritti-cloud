import { buildSiteMatrix } from '@domain/catalog/site-matrix.builder';
import { OrganizationRepository } from '@domain/cloud-organization/repositories/organization.repository';
import { Injectable, Logger } from '@nestjs/common';
import type { SiteType } from '@vritti/api-sdk/catalog-resolver';
import type { CreateResponseDto, SuccessResponseDto } from '@vritti/api-sdk/database';
import { ForbiddenException, NotFoundException } from '@vritti/api-sdk/exceptions';
import type { Deployment, Organization } from '@/db/schema';
import { siteAppliesEnum } from '@/db/schema/enums';
import { CoreVersionRepository } from '@/modules/core-server/repositories/core-version.repository';
import { CatalogSyncService } from '@/modules/core-server/services/catalog-sync.service';
import { CoreDeploymentService } from '@/modules/core-server/services/core-deployment.service';
import { CoreRoleService } from '@/modules/core-server/services/core-role.service';
import { CoreSiteService } from '@/modules/core-server/services/core-site.service';
import { requireSigningKey } from '@/modules/core-server/signing-key.util';
import { CoreRoleDto } from '../../dto/entity/core-role.dto';
import { RoleAssignmentDto } from '../../dto/entity/role-assignment.dto';
import { SiteDto } from '../../dto/entity/site.dto';
import type { AssignRoleDto } from '../../dto/request/assign-role.dto';
import type { SetLocksDto } from '../../dto/request/set-locks.dto';
import type { SiteMatrixResponseDto } from '../../dto/response/site-matrix.response.dto';
import { loadPlanContext } from '../../utils/load-plan-context';
import { validateLocksShape } from '../../utils/validate-locks-shape';
import type { CreateSiteDto } from '../dto/request/create-site.dto';
import type { ReorderSitesDto } from '../dto/request/reorder-sites.dto';
import type { UpdateSiteDto } from '../dto/request/update-site.dto';
import type { SiteListResponseDto } from '../dto/response/site-list.response.dto';

@Injectable()
export class OrganizationSitesService {
  private readonly logger = new Logger(OrganizationSitesService.name);

  constructor(
    private readonly coreDeploymentService: CoreDeploymentService,
    private readonly organizationRepository: OrganizationRepository,
    private readonly coreVersionRepository: CoreVersionRepository,
    private readonly coreSiteService: CoreSiteService,
    private readonly catalogSyncService: CatalogSyncService,
    private readonly coreRoleService: CoreRoleService,
  ) {}

  // Lists all sites for the organization from core
  async listSites(orgId: string): Promise<SiteListResponseDto> {
    const { org, deployment } = await this.coreDeploymentService.resolveOrgDeployment(orgId);

    const sites = await this.coreSiteService.getSites(deployment.url, requireSigningKey(deployment), org.orgIdentifier);
    this.logger.log(`Fetched sites for org ${orgId}`);
    return { result: sites };
  }

  // Creates a new site in core after checking plan limits
  async createSite(orgId: string, data: CreateSiteDto): Promise<CreateResponseDto<SiteDto>> {
    const { org, deployment } = await this.coreDeploymentService.resolveOrgDeployment(orgId);

    await this.checkSiteLimit(org, deployment);

    const site = await this.coreSiteService.createSite(
      deployment.url,
      requireSigningKey(deployment),
      org.orgIdentifier,
      this.packMetadata(data),
    );
    await this.catalogSyncService.syncRoles(orgId);
    this.logger.log(`Created site for org ${orgId}`);
    return { success: true, message: `Site "${site.name}" created successfully.`, data: site };
  }

  // Fetches a single site from core
  async getSite(orgId: string, siteId: string): Promise<SiteDto> {
    const { org, deployment } = await this.coreDeploymentService.resolveOrgDeployment(orgId);

    const result = await this.coreSiteService.getSite(
      deployment.url,
      requireSigningKey(deployment),
      org.orgIdentifier,
      siteId,
    );
    const site = this.pickSite(result, siteId);
    if (!site) throw new NotFoundException('Site not found.');
    this.logger.log(`Fetched site ${siteId} for org ${orgId}`);
    return site;
  }

  // Updates a site in core
  async updateSite(orgId: string, siteId: string, data: UpdateSiteDto): Promise<SuccessResponseDto> {
    const { org, deployment } = await this.coreDeploymentService.resolveOrgDeployment(orgId);

    const result = await this.coreSiteService.updateSite(
      deployment.url,
      requireSigningKey(deployment),
      org.orgIdentifier,
      siteId,
      this.packMetadata(data),
    );
    this.logger.log(`Updated site ${siteId} for org ${orgId}`);
    return result;
  }

  // Reorders a batch of sites within a legal entity in core
  async reorderSites(orgId: string, dto: ReorderSitesDto): Promise<SuccessResponseDto> {
    const { org, deployment } = await this.coreDeploymentService.resolveOrgDeployment(orgId);

    const result = await this.coreSiteService.reorderSites(
      deployment.url,
      requireSigningKey(deployment),
      org.orgIdentifier,
      dto.ids,
    );
    this.logger.log(`Reordered ${dto.ids.length} site(s) for org ${orgId}`);
    return result;
  }

  // Deletes a site in core
  async deleteSite(orgId: string, siteId: string): Promise<SuccessResponseDto> {
    const { org, deployment } = await this.coreDeploymentService.resolveOrgDeployment(orgId);

    const result = await this.coreSiteService.deleteSite(
      deployment.url,
      requireSigningKey(deployment),
      org.orgIdentifier,
      siteId,
    );
    this.logger.log(`Deleted site ${siteId} for org ${orgId}`);
    return result;
  }

  // Lists role assignments for a site
  async getRoleAssignments(orgId: string, siteId: string): Promise<RoleAssignmentDto[]> {
    const { org, deployment } = await this.coreDeploymentService.resolveOrgDeployment(orgId);

    return this.coreSiteService.getRoleAssignments(
      deployment.url,
      requireSigningKey(deployment),
      org.orgIdentifier,
      siteId,
    );
  }

  // Assigns a role to a user at a site and returns the created assignment
  async assignRole(
    orgId: string,
    siteId: string,
    data: AssignRoleDto,
  ): Promise<CreateResponseDto<RoleAssignmentDto | null>> {
    const { org, deployment } = await this.coreDeploymentService.resolveOrgDeployment(orgId);
    const signingKey = requireSigningKey(deployment);

    await this.coreRoleService.assignRole(deployment.url, signingKey, org.orgIdentifier, data.userId, {
      roleId: data.roleId,
      siteId,
    });
    const assignments = await this.coreSiteService.getRoleAssignments(
      deployment.url,
      signingKey,
      org.orgIdentifier,
      siteId,
    );
    const assignment = assignments.find((a) => a.userId === data.userId && a.roleId === data.roleId) ?? null;
    this.logger.log(`Assigned role ${data.roleId} to user ${data.userId} at site ${siteId} in org ${orgId}`);
    return {
      success: true,
      message: assignment ? `Role "${assignment.roleName}" assigned successfully.` : 'Role assigned successfully.',
      data: assignment,
    };
  }

  // Removes a role assignment
  async removeRoleAssignment(orgId: string, assignmentId: string): Promise<SuccessResponseDto> {
    const { org, deployment } = await this.coreDeploymentService.resolveOrgDeployment(orgId);

    return this.coreRoleService.removeRoleAssignment(
      deployment.url,
      requireSigningKey(deployment),
      org.orgIdentifier,
      assignmentId,
    );
  }

  // Returns the site permission matrix for the lock editor
  async getSiteMatrix(orgId: string, siteId: string): Promise<SiteMatrixResponseDto> {
    const { org, deployment } = await this.coreDeploymentService.resolveOrgDeployment(orgId);
    const { snapshot } = await loadPlanContext(this.coreVersionRepository, org, deployment);
    const result = await this.coreSiteService.getSite(
      deployment.url,
      requireSigningKey(deployment),
      org.orgIdentifier,
      siteId,
    );
    const siteType = this.resolveSiteType(this.pickSite(result, siteId));
    return buildSiteMatrix(snapshot, org.businessCode, org.planCode, org.siteLocks?.[siteId], siteType);
  }

  // Normalizes core's single-site response (object or list) to the requested site
  private pickSite(result: SiteDto | SiteDto[] | null, siteId: string): SiteDto | undefined {
    const list = Array.isArray(result) ? result : result ? [result] : [];
    return list.find((site) => site?.id === siteId) ?? list[0];
  }

  // Narrows the core site's type string to a SiteType
  private resolveSiteType(site: SiteDto | undefined): SiteType | undefined {
    return site && (siteAppliesEnum.enumValues as readonly string[]).includes(site.type)
      ? (site.type as SiteType)
      : undefined;
  }

  // Replaces the site's lock deny-list and pushes it to core
  async updateSiteLocks(orgId: string, siteId: string, dto: SetLocksDto): Promise<SuccessResponseDto> {
    const { org } = await this.coreDeploymentService.resolveOrgDeployment(orgId);

    const siteLocks = { ...(org.siteLocks ?? {}) };
    siteLocks[siteId] = validateLocksShape(dto.locks);
    await this.organizationRepository.update(orgId, { siteLocks });

    await this.catalogSyncService.syncSiteLocks(orgId, siteId);
    this.logger.log(`Updated locks for site ${siteId} in org ${orgId}`);
    return { success: true, message: 'Site permissions updated successfully.' };
  }

  // Returns roles compatible with a site's assigned apps
  async getCompatibleRoles(orgId: string, siteId: string): Promise<CoreRoleDto[]> {
    const { org, deployment } = await this.coreDeploymentService.resolveOrgDeployment(orgId);

    return this.coreRoleService.getCompatibleRoles(
      deployment.url,
      requireSigningKey(deployment),
      org.orgIdentifier,
      siteId,
    );
  }

  // Packs location fields into site metadata
  private packMetadata(data: CreateSiteDto | UpdateSiteDto): Record<string, unknown> {
    const { address, city, state, country, phone, ...rest } = data;
    const metadata: Record<string, unknown> = {};
    if (address) metadata.address = address;
    if (city) metadata.city = city;
    if (state) metadata.state = state;
    if (country) metadata.country = country;
    if (phone) metadata.phone = phone;

    return Object.keys(metadata).length > 0 ? { ...rest, metadata } : rest;
  }

  // Checks if the organization has reached its plan's max site limit
  private async checkSiteLimit(org: Organization, deployment: Deployment): Promise<void> {
    const { plan } = await loadPlanContext(this.coreVersionRepository, org, deployment);

    if (plan.maxSites === null) return;

    const sites = await this.coreSiteService.getSites(deployment.url, requireSigningKey(deployment), org.orgIdentifier);
    const currentCount = Array.isArray(sites) ? sites.length : 0;

    if (currentCount >= plan.maxSites) {
      throw new ForbiddenException({
        label: 'Site Limit Reached',
        detail: `Your plan allows a maximum of ${plan.maxSites} sites. Please upgrade to create more.`,
      });
    }
  }
}
