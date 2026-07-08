import { Injectable, Logger } from '@nestjs/common';
import { DataTableStateService } from '@vritti/api-sdk/data-table';
import { type FieldMap, FilterProcessor, SuccessResponseDto } from '@vritti/api-sdk/database';
import { and, type Column, eq, sql } from '@vritti/api-sdk/drizzle-orm';
import { NotFoundException } from '@vritti/api-sdk/exceptions';
import { businesses, deployments, organizations } from '@/db/schema';
import { OrganizationDto } from '@/modules/admin-api/deployment/organization/dto/entity/organization.dto';
import { OrganizationDetailDto } from '@/modules/admin-api/deployment/organization/dto/entity/organization-detail.dto';
import { OrganizationTableResponseDto } from '@/modules/admin-api/deployment/organization/dto/response/organizations-response.dto';
import { CatalogSyncService } from '@/modules/core-server/services/catalog-sync.service';
import { OrganizationRepository } from '../repositories/organization.repository';

@Injectable()
export class OrganizationService {
  private readonly logger = new Logger(OrganizationService.name);

  private static readonly FIELD_MAP: FieldMap = {
    name: { column: organizations.name, type: 'string' },
    subdomain: { column: organizations.subdomain, type: 'string' },
    size: { column: organizations.size, type: 'string' },
    planCode: { column: organizations.planCode, type: 'string' },
    businessName: { column: businesses.name, type: 'string' },
    deploymentName: { column: deployments.name, type: 'string' },
    businessId: { column: businesses.id, type: 'string' },
    memberCount: {
      column:
        sql<number>`(SELECT count(*) FROM cloud.organization_members WHERE organization_id = ${organizations.id})` as unknown as Column,
      type: 'number',
    },
  };

  constructor(
    private readonly organizationRepository: OrganizationRepository,
    private readonly dataTableStateService: DataTableStateService,
    private readonly catalogSyncService: CatalogSyncService,
  ) {}

  // Returns all organizations with counts, applying server-stored filter/sort/search/pagination state
  async findForTable(userId: string, deploymentId?: string): Promise<OrganizationTableResponseDto> {
    const { state, activeViewId } = await this.dataTableStateService.getCurrentState(userId, 'organizations');
    const where = and(
      FilterProcessor.buildWhere(state.filters, OrganizationService.FIELD_MAP),
      FilterProcessor.buildSearch(state.search, OrganizationService.FIELD_MAP),
      deploymentId ? eq(organizations.deploymentId, deploymentId) : undefined,
    );
    const { limit = 20, offset = 0 } = state.pagination ?? {};
    const { rows, total } = await this.organizationRepository.findAllWithCounts({
      where,
      orderBy: FilterProcessor.buildOrderBy(state.sort, OrganizationService.FIELD_MAP),
      limit,
      offset,
    });
    const result = rows.map(OrganizationDto.from);
    this.logger.log(`Fetched organizations table (${total} results, limit: ${limit}, offset: ${offset})`);
    return { result, count: total, state, activeViewId };
  }

  // Finds an organization by ID with full details; throws NotFoundException if not found
  async findById(id: string): Promise<OrganizationDetailDto> {
    const org = await this.organizationRepository.findByIdWithDetails(id);
    if (!org) {
      throw new NotFoundException('Organization not found.');
    }
    this.logger.log(`Fetched organization: ${id}`);
    return OrganizationDetailDto.from(org);
  }

  // Re-pushes the deployment catalog, org entitlements and roles for the org's deployment
  async resyncDeployment(orgId: string): Promise<SuccessResponseDto> {
    const org = await this.organizationRepository.findById(orgId);
    if (!org) throw new NotFoundException('Organization not found.');

    await this.catalogSyncService.resyncDeployment(org.deploymentId);

    this.logger.log(`Resynced deployment ${org.deploymentId} for org ${orgId}`);
    return { success: true, message: 'Deployment catalog, entitlements and roles re-pushed successfully.' };
  }
}
