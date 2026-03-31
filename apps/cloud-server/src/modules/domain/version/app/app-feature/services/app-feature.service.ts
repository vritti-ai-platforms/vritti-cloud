import { Injectable, Logger } from '@nestjs/common';
import {
  ConflictException,
  DataTableStateService,
  type FieldMap,
  FilterProcessor,
  NotFoundException,
  SuccessResponseDto,
} from '@vritti/api-sdk';
import { and } from '@vritti/api-sdk/drizzle-orm';
import { features } from '@/db/schema';
import { AppRepository } from '../../root/repositories/app.repository';
import type { AssignFeaturesDto } from '@/modules/admin-api/version/app/app-feature/dto/request/assign-features.dto';
import { AppFeatureTableRowDto } from '@/modules/admin-api/version/app/app-feature/dto/entity/app-feature-table-row.dto';
import type { AppFeatureTableResponseDto } from '@/modules/admin-api/version/app/app-feature/dto/response/app-feature-table-response.dto';
import { AppFeatureRepository } from '../repositories/app-feature.repository';

@Injectable()
export class AppFeatureService {
  private readonly logger = new Logger(AppFeatureService.name);

  private static readonly FIELD_MAP: FieldMap = {
    code: { column: features.code, type: 'string' },
    name: { column: features.name, type: 'string' },
  };

  constructor(
    private readonly appFeatureRepository: AppFeatureRepository,
    private readonly appRepository: AppRepository,
    private readonly dataTableStateService: DataTableStateService,
  ) {}

  // Returns app features for the data table with server-stored filter/sort/search/pagination state
  async findForTable(userId: string, appId: string): Promise<AppFeatureTableResponseDto> {
    await this.ensureAppExists(appId);
    const { state, activeViewId } = await this.dataTableStateService.getCurrentState(userId, `app-features-${appId}`);
    const filterWhere = FilterProcessor.buildWhere(state.filters, AppFeatureService.FIELD_MAP);
    const searchWhere = FilterProcessor.buildSearch(state.search, AppFeatureService.FIELD_MAP);
    const where = and(filterWhere, searchWhere);
    const orderBy = FilterProcessor.buildOrderBy(state.sort, AppFeatureService.FIELD_MAP);
    const { limit = 20, offset = 0 } = state.pagination ?? {};
    const { rows, total } = await this.appFeatureRepository.findAllForTable(appId, where, orderBy, limit, offset);
    this.logger.log(`Fetched app features table for app: ${appId} (${total} results, limit: ${limit}, offset: ${offset})`);
    return { result: rows.map(AppFeatureTableRowDto.from), count: total, state, activeViewId };
  }

  // Lists all features assigned to an app with details
  async findByApp(appId: string): Promise<
    Array<{
      id: string;
      featureId: string;
      code: string;
      name: string;
      sortOrder: number;
    }>
  > {
    await this.ensureAppExists(appId);
    this.logger.log(`Fetched features for app: ${appId}`);
    return this.appFeatureRepository.findByAppWithFeatures(appId);
  }

  // Assigns features to an app; validates all featureIds exist, then bulk upserts
  async assignFeatures(appId: string, dto: AssignFeaturesDto): Promise<SuccessResponseDto> {
    const app = await this.appRepository.findById(appId);
    if (!app) {
      throw new NotFoundException('App not found.');
    }
    if (dto.featureIds.length > 0) {
      const existingIds = await this.appFeatureRepository.findExistingFeatureIds(dto.featureIds);
      const missing = dto.featureIds.filter((id) => !existingIds.has(id));
      if (missing.length > 0) {
        throw new NotFoundException(`Features not found: ${missing.join(', ')}`);
      }
      await this.appFeatureRepository.upsertMany(
        dto.featureIds.map((featureId) => ({
          versionId: app.versionId,
          appId,
          featureId,
        })),
      );
    }
    this.logger.log(`Assigned ${dto.featureIds.length} features to app: ${appId}`);
    return { success: true, message: 'Features assigned successfully.' };
  }

  // Removes a feature from an app; rejects if referenced by any role template feature permissions
  async removeFeature(appId: string, featureId: string): Promise<SuccessResponseDto> {
    await this.ensureAppExists(appId);
    const link = await this.appFeatureRepository.findByAppAndFeature(appId, featureId);
    if (!link) {
      throw new NotFoundException('Feature is not assigned to this app.');
    }
    const roleRefs = await this.appFeatureRepository.countRoleReferences(featureId);
    if (roleRefs > 0) {
      throw new ConflictException({
        label: 'Feature In Use',
        detail: `Cannot remove this feature — it is referenced by ${roleRefs} role permission${roleRefs > 1 ? 's' : ''}. Remove those role assignments first.`,
      });
    }
    await this.appFeatureRepository.removeByAppAndFeature(appId, featureId);
    this.logger.log(`Removed feature ${featureId} from app: ${appId}`);
    return { success: true, message: 'Feature removed from app successfully.' };
  }

  // Validates that an app exists; throws NotFoundException otherwise
  private async ensureAppExists(appId: string): Promise<void> {
    const app = await this.appRepository.findById(appId);
    if (!app) {
      throw new NotFoundException('App not found.');
    }
  }
}
