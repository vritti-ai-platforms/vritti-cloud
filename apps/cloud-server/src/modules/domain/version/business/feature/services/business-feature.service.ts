import { Injectable, Logger } from '@nestjs/common';
import { DataTableStateService } from '@vritti/api-sdk/data-table';
import { type FieldMap, FilterProcessor, SuccessResponseDto } from '@vritti/api-sdk/database';
import { and } from '@vritti/api-sdk/drizzle-orm';
import { BadRequestException, NotFoundException } from '@vritti/api-sdk/exceptions';
import { businessAppFeatures, businessApps, features } from '@/db/schema';
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
    // Column (not expression) so the multi-select filter's isAnyOf → inArray works; the table query is FROM app_features
    appId: { column: businessAppFeatures.appId, type: 'string' },
    // Sorts the App column by app name (apps is joined in findBusinessFeaturesForTable)
    app: { column: businessApps.name, type: 'string' },
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

  // Pins a feature to a single app within a business (appId null removes it from the business)
  async setApp(
    versionId: string,
    businessId: string,
    featureId: string,
    appId: string | null,
  ): Promise<SuccessResponseDto> {
    const feature = await this.featureRepository.findByIdWithPermissionCheck(featureId);
    if (!feature || feature.feature.versionId !== versionId) {
      throw new NotFoundException('Feature not found.');
    }
    if (appId && !feature.hasPermissions) {
      throw new BadRequestException({
        label: 'Missing Permissions',
        detail: 'This feature must have at least one permission before it can be assigned to an app.',
      });
    }

    if (appId) {
      const app = await this.appRepository.findById(appId);
      if (!app || app.versionId !== versionId || app.businessId !== businessId) {
        throw new BadRequestException({
          label: 'Invalid App',
          detail: 'The selected app does not belong to this business.',
        });
      }
    }

    await this.appFeatureRepository.setFeatureApp(versionId, businessId, featureId, appId);
    this.logger.log(`Set app ${appId ?? 'none'} for feature ${featureId} in business: ${businessId}`);
    return { success: true, message: `App for "${feature.feature.name}" updated successfully.` };
  }

  // Adds many features to a business under one app at once, validating the app + each feature (rejecting the whole batch otherwise)
  async assignFeaturesToApp(
    versionId: string,
    businessId: string,
    appId: string,
    featureIds: string[],
  ): Promise<SuccessResponseDto> {
    const app = await this.appRepository.findById(appId);
    if (!app || app.versionId !== versionId || app.businessId !== businessId) {
      throw new BadRequestException({
        label: 'Invalid App',
        detail: 'The selected app does not belong to this business.',
      });
    }

    const uniqueIds = [...new Set(featureIds)];
    const addable = new Set(await this.featureRepository.findAddableIds(versionId, businessId, uniqueIds));
    const invalid = uniqueIds.filter((id) => !addable.has(id));
    if (invalid.length > 0) {
      throw new BadRequestException({
        label: 'Invalid Features',
        detail: `${invalid.length} selected feature(s) can't be added — they don't belong to this version or have no permissions.`,
      });
    }

    await this.appFeatureRepository.assignFeaturesToApp(versionId, businessId, appId, uniqueIds);
    this.logger.log(`Added ${uniqueIds.length} feature(s) to app ${appId} in business: ${businessId}`);
    return { success: true, message: `${uniqueIds.length} feature(s) added to this business.` };
  }

  // Removes many features from a business at once (unassigns each from its app) in a single statement
  async removeFromBusiness(_versionId: string, businessId: string, featureIds: string[]): Promise<SuccessResponseDto> {
    await this.appFeatureRepository.removeFeaturesFromBusiness(businessId, featureIds);
    this.logger.log(`Removed ${featureIds.length} feature(s) from business: ${businessId}`);
    return { success: true, message: `${featureIds.length} feature(s) removed from this business.` };
  }
}
