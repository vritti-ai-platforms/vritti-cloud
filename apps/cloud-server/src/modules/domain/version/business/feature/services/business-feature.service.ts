import { Injectable, Logger } from '@nestjs/common';
import {
  BadRequestException,
  DataTableStateService,
  type FieldMap,
  FilterProcessor,
  NotFoundException,
  SuccessResponseDto,
} from '@vritti/api-sdk';
import { and, eq, sql } from '@vritti/api-sdk/drizzle-orm';
import { appFeatures, features } from '@/db/schema';
import { BusinessFeatureDto } from '@/modules/admin-api/version/business/feature/dto/entity/business-feature.dto';
import { BusinessFeaturePermissionDto } from '@/modules/admin-api/version/business/feature/dto/entity/business-feature-permission.dto';
import type { BusinessFeatureTableResponseDto } from '@/modules/admin-api/version/business/feature/dto/response/business-feature-table-response.dto';
import { FeaturePermissionRepository } from '../../../feature/feature-permission/repositories/feature-permission.repository';
import { FeatureRepository } from '../../../feature/root/repositories/feature.repository';
import { AppFeatureRepository } from '../../app/app-feature/repositories/app-feature.repository';
import { AppRepository } from '../../app/root/repositories/app.repository';

@Injectable()
export class BusinessFeatureService {
  private readonly logger = new Logger(BusinessFeatureService.name);

  private static readonly FIELD_MAP: FieldMap = {
    name: { column: features.name, type: 'string' },
    code: { column: features.code, type: 'string' },
    appId: {
      expression: (value) =>
        sql`exists (select 1 from ${appFeatures} af where af.feature_id = ${features.id} and af.app_id = ${value})`,
      type: 'string',
    },
  };

  constructor(
    private readonly appFeatureRepository: AppFeatureRepository,
    private readonly appRepository: AppRepository,
    private readonly featureRepository: FeatureRepository,
    private readonly featurePermissionRepository: FeaturePermissionRepository,
    private readonly dataTableStateService: DataTableStateService,
  ) {}

  // Returns the features a business's apps include (with their apps + permission count) for the data table
  async findForTable(versionId: string, businessId: string, userId: string): Promise<BusinessFeatureTableResponseDto> {
    const { state, activeViewId } = await this.dataTableStateService.getCurrentState(
      userId,
      `business-features-${businessId}`,
    );
    const where = and(
      FilterProcessor.buildWhere(state.filters, BusinessFeatureService.FIELD_MAP),
      FilterProcessor.buildSearch(state.search, BusinessFeatureService.FIELD_MAP),
    );
    const orderBy = FilterProcessor.buildOrderBy(state.sort, BusinessFeatureService.FIELD_MAP);
    const { limit = 20, offset = 0 } = state.pagination ?? {};
    const { result, count } = await this.appFeatureRepository.findBusinessFeaturesForTable(versionId, businessId, {
      where,
      orderBy,
      limit,
      offset,
    });
    this.logger.log(`Fetched features table for business: ${businessId} (${count} results)`);
    return { result: result.map(BusinessFeatureDto.from), count, state, activeViewId };
  }

  // Returns the permissions of a feature that apply to a business (global or business-linked)
  async findPermissions(
    versionId: string,
    businessId: string,
    featureId: string,
  ): Promise<BusinessFeaturePermissionDto[]> {
    const feature = await this.featureRepository.findById(featureId);
    if (!feature || feature.versionId !== versionId) {
      throw new NotFoundException('Feature not found.');
    }
    const permissions = await this.featurePermissionRepository.findVisibleForFeature(featureId, businessId);
    this.logger.log(`Fetched ${permissions.length} permissions for feature ${featureId} in business: ${businessId}`);
    return permissions.map(BusinessFeaturePermissionDto.from);
  }

  // Replaces the apps a feature is assigned to within a business
  async setApps(
    versionId: string,
    businessId: string,
    featureId: string,
    appIds: string[],
  ): Promise<SuccessResponseDto> {
    const feature = await this.featureRepository.findByIdWithPermissionCheck(featureId);
    if (!feature || feature.feature.versionId !== versionId) {
      throw new NotFoundException('Feature not found.');
    }
    if (appIds.length > 0 && !feature.hasPermissions) {
      throw new BadRequestException({
        label: 'Missing Permissions',
        detail: 'This feature must have at least one permission before it can be assigned to an app.',
      });
    }

    const businessApps = await this.appRepository.findAllByVersionAndBusiness(versionId, businessId);
    const businessAppIds = businessApps.map((app) => app.id);
    const invalid = appIds.filter((id) => !businessAppIds.includes(id));
    if (invalid.length > 0) {
      throw new BadRequestException({
        label: 'Invalid Apps',
        detail: 'One or more selected apps do not belong to this business.',
      });
    }

    await this.appFeatureRepository.setFeatureApps(versionId, featureId, businessAppIds, appIds);
    this.logger.log(`Set ${appIds.length} app(s) for feature ${featureId} in business: ${businessId}`);
    return { success: true, message: `Apps for "${feature.feature.name}" updated successfully.` };
  }
}
