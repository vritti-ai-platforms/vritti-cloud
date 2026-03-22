import { Injectable, Logger } from '@nestjs/common';
import {
  DataTableStateService,
  type FieldMap,
  FilterProcessor,
  NotFoundException,
  ServiceUnavailableException,
  SuccessResponseDto,
} from '@vritti/api-sdk';
import { type Column, and, sql } from '@vritti/api-sdk/drizzle-orm';
import { deployments, industries, organizations, plans } from '@/db/schema';
import { DeploymentRepository } from '@/modules/admin-api/deployment/repositories/deployment.repository';
import { CoreAppVersionRepository } from '@/modules/core-server/repositories/core-app-version.repository';
import { CoreOrganizationService } from '@/modules/core-server/services/core-organization.service';
import { OrganizationDto } from '../dto/entity/organization.dto';
import { OrganizationDetailDto } from '../dto/entity/organization-detail.dto';
import { OrganizationTableResponseDto } from '../dto/response/organizations-response.dto';
import { OrganizationRepository } from '../repositories/organization.repository';

@Injectable()
export class OrganizationService {
  private readonly logger = new Logger(OrganizationService.name);

  private static readonly FIELD_MAP: FieldMap = {
    name: { column: organizations.name, type: 'string' },
    subdomain: { column: organizations.subdomain, type: 'string' },
    size: { column: organizations.size, type: 'string' },
    planName: { column: plans.name, type: 'string' },
    industryName: { column: industries.name, type: 'string' },
    deploymentName: { column: deployments.name, type: 'string' },
    planId: { column: organizations.planId, type: 'string' },
    industryId: { column: organizations.industryId, type: 'string' },
    memberCount: {
      column: sql<number>`(SELECT count(*) FROM cloud.organization_members WHERE organization_id = ${organizations.id})` as unknown as Column,
      type: 'number',
    },
  };

  constructor(
    private readonly organizationRepository: OrganizationRepository,
    private readonly dataTableStateService: DataTableStateService,
    private readonly deploymentRepository: DeploymentRepository,
    private readonly coreAppVersionRepository: CoreAppVersionRepository,
    private readonly coreOrganizationService: CoreOrganizationService,
  ) {}

  // Returns all organizations with counts, applying server-stored filter/sort/search/pagination state
  async findForTable(userId: string): Promise<OrganizationTableResponseDto> {
    const { state, activeViewId } = await this.dataTableStateService.getCurrentState(userId, 'organizations');
    const where = and(
      FilterProcessor.buildWhere(state.filters, OrganizationService.FIELD_MAP),
      FilterProcessor.buildSearch(state.search, OrganizationService.FIELD_MAP),
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

  // Syncs the feature catalog from the deployment's app version snapshot to core-server
  async syncFeatureCatalog(orgId: string): Promise<SuccessResponseDto> {
    const org = await this.organizationRepository.findById(orgId);
    if (!org) throw new NotFoundException('Organization not found.');

    const deployment = await this.deploymentRepository.findById(org.deploymentId);
    if (!deployment?.appVersionId) throw new NotFoundException('Deployment or app version not found.');

    const appVersion = await this.coreAppVersionRepository.findById(deployment.appVersionId);
    if (!appVersion?.snapshot) throw new NotFoundException('App version snapshot not found.');

    const snapshot = appVersion.snapshot as Record<string, unknown>;
    const features = (snapshot.features ?? []) as Array<Record<string, unknown>>;

    const featureCatalog = features
      .filter((f) => f.microfrontends && (f.microfrontends as Record<string, unknown>).WEB)
      .map((f) => {
        const webMf = (f.microfrontends as Record<string, Record<string, string>>).WEB;
        return {
          code: f.code,
          name: f.name,
          icon: f.icon ?? null,
          remoteEntry: webMf.remoteEntry,
          exposedModule: webMf.exposedModule,
          routePrefix: webMf.routePrefix,
        };
      });


    try {
      await this.coreOrganizationService.updateOrganization(
        deployment.url,
        deployment.webhookSecret,
        org.orgIdentifier,
        { featureCatalog },
      );
    } catch (error: any) {
      this.logger.error(`Failed to sync feature catalog for org ${orgId}: ${error}`);
      throw new ServiceUnavailableException({
        label: 'Deployment Unreachable',
        detail: 'Unable to reach the deployment to sync the feature catalog.',
      });
    }

    this.logger.log(`Synced feature catalog for org ${orgId} (${featureCatalog.length} features)`);
    return { success: true, message: `Feature catalog synced (${featureCatalog.length} features).` };
  }
}
