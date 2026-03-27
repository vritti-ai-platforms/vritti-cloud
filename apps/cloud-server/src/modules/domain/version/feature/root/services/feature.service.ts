import { Injectable, Logger } from '@nestjs/common';
import {
  ConflictException,
  CreateResponseDto,
  DataTableStateService,
  type FieldMap,
  FilterProcessor,
  NotFoundException,
  SelectOptionsQueryDto,
  type SelectQueryResult,
  SuccessResponseDto,
} from '@vritti/api-sdk';
import { and } from '@vritti/api-sdk/drizzle-orm';
import { features } from '@/db/schema';
import { FeatureDto } from '@/modules/admin-api/version/feature/root/dto/entity/feature.dto';
import type { BulkCreateFeaturesDto } from '@/modules/admin-api/version/feature/root/dto/request/bulk-create-features.dto';
import type { CreateFeatureDto } from '@/modules/admin-api/version/feature/root/dto/request/create-feature.dto';
import type { UpdateFeatureDto } from '@/modules/admin-api/version/feature/root/dto/request/update-feature.dto';
import { FeatureTableResponseDto } from '@/modules/admin-api/version/feature/root/dto/response/feature-table-response.dto';
import type { FeatureWithPermissionsResponseDto } from '@/modules/admin-api/version/feature/root/dto/response/feature-with-permissions-response.dto';
import { FeatureRepository } from '../repositories/feature.repository';

@Injectable()
export class FeatureService {
  private readonly logger = new Logger(FeatureService.name);

  private static readonly FIELD_MAP: FieldMap = {
    name: { column: features.name, type: 'string' },
    code: { column: features.code, type: 'string' },
  };

  constructor(
    private readonly featureRepository: FeatureRepository,
    private readonly dataTableStateService: DataTableStateService,
  ) {}

  // Creates a new feature; throws ConflictException on duplicate code
  async create(dto: CreateFeatureDto): Promise<CreateResponseDto<FeatureDto>> {
    const existingCode = await this.featureRepository.findByCode(dto.code);
    if (existingCode) {
      throw new ConflictException({
        label: 'Code Already Exists',
        detail: 'A feature with this code already exists. Please choose a different code.',
        errors: [{ field: 'code', message: 'Duplicate code' }],
      });
    }
    const feature = await this.featureRepository.create(dto);
    this.logger.log(`Created feature: ${feature.name} (${feature.id})`);
    return { success: true, message: 'Feature created successfully.', data: FeatureDto.from(feature, true) };
  }

  // Returns all features with server-stored filter/sort/search/pagination state applied
  async findForTable(userId: string): Promise<FeatureTableResponseDto> {
    const { state, activeViewId } = await this.dataTableStateService.getCurrentState(userId, 'features');
    const filterWhere = FilterProcessor.buildWhere(state.filters, FeatureService.FIELD_MAP);
    const searchWhere = FilterProcessor.buildSearch(state.search, FeatureService.FIELD_MAP);
    const where = and(filterWhere, searchWhere);
    const orderBy = FilterProcessor.buildOrderBy(state.sort, FeatureService.FIELD_MAP);
    const { limit = 20, offset = 0 } = state.pagination ?? {};
    const { result, count } = await this.featureRepository.findAllAndCount({ where, orderBy, limit, offset });
    const referencedIds = await this.featureRepository.findReferencedIds(result.map((r) => r.id));
    this.logger.log(`Fetched features table (${count} results, limit: ${limit}, offset: ${offset})`);
    return { result: result.map((r) => FeatureDto.from(r, !referencedIds.has(r.id))), count, state, activeViewId };
  }

  // Returns paginated feature options for the select component
  findForSelect(query: SelectOptionsQueryDto): Promise<SelectQueryResult> {
    this.logger.log(`Fetched feature select options (limit: ${query.limit}, offset: ${query.offset}, search: ${query.search})`);
    return this.featureRepository.findForSelect({
      value: query.valueKey || 'id',
      label: query.labelKey || 'name',
      description: query.descriptionKey,
      groupId: query.groupIdKey,
      search: query.search,
      limit: query.limit,
      offset: query.offset,
      values: query.values,
      excludeIds: query.excludeIds,
      orderBy: { name: 'asc' },
    });
  }

  // Returns all features for a version with their permission types and app codes
  async findWithPermissions(versionId: string): Promise<FeatureWithPermissionsResponseDto[]> {
    const [allFeatures, permissionsMap, appCodesMap] = await Promise.all([
      this.featureRepository.findAllByVersionId(versionId),
      this.featureRepository.findPermissionsByVersionId(versionId),
      this.featureRepository.findAppCodesByVersionId(versionId),
    ]);

    this.logger.log(`Fetched ${allFeatures.length} features with permissions for version ${versionId}`);

    return allFeatures.map((feature) => ({
      id: feature.id,
      code: feature.code,
      name: feature.name,
      icon: feature.icon,
      permissions: permissionsMap.get(feature.id) ?? [],
      appCodes: appCodesMap.get(feature.id) ?? [],
    }));
  }

  // Finds a feature by ID; throws NotFoundException if not found
  async findById(id: string): Promise<FeatureDto> {
    const feature = await this.featureRepository.findById(id);
    if (!feature) {
      throw new NotFoundException('Feature not found.');
    }
    const refs = await this.featureRepository.countAppFeatureReferences(id);
    this.logger.log(`Fetched feature: ${id}`);
    return FeatureDto.from(feature, refs === 0);
  }

  // Updates a feature by ID; throws NotFoundException if not found, ConflictException on duplicate code
  async update(id: string, dto: UpdateFeatureDto): Promise<SuccessResponseDto> {
    const existing = await this.featureRepository.findById(id);
    if (!existing) {
      throw new NotFoundException('Feature not found.');
    }
    if (dto.code) {
      const existingCode = await this.featureRepository.findByCode(dto.code);
      if (existingCode && existingCode.id !== id) {
        throw new ConflictException({
          label: 'Code Already Exists',
          detail: 'A feature with this code already exists. Please choose a different code.',
          errors: [{ field: 'code', message: 'Duplicate code' }],
        });
      }
    }
    const feature = await this.featureRepository.update(id, dto);
    this.logger.log(`Updated feature: ${feature.name} (${feature.id})`);
    return { success: true, message: 'Feature updated successfully.' };
  }

  // Deletes a feature by ID; throws NotFoundException if not found, ConflictException if referenced
  async delete(id: string): Promise<SuccessResponseDto> {
    const existing = await this.featureRepository.findById(id);
    if (!existing) {
      throw new NotFoundException('Feature not found.');
    }
    const refs = await this.featureRepository.countAppFeatureReferences(id);
    if (refs > 0) {
      throw new ConflictException({
        label: 'Feature In Use',
        detail: `Cannot delete "${existing.name}" — it is referenced by ${refs} app feature${refs > 1 ? 's' : ''}. Remove those references first.`,
      });
    }
    await this.featureRepository.delete(id);
    this.logger.log(`Deleted feature: ${existing.name} (${existing.id})`);
    return { success: true, message: 'Feature deleted successfully.' };
  }

  // Bulk-creates features for seeding; skips existing codes and returns created/skipped counts
  async bulkCreate(dto: BulkCreateFeaturesDto): Promise<{ created: number; skipped: number }> {
    let created = 0;
    let skipped = 0;
    for (const featureDto of dto.features) {
      const existing = await this.featureRepository.findByCode(featureDto.code);
      if (existing) {
        skipped++;
        continue;
      }
      await this.featureRepository.create(featureDto);
      created++;
    }
    this.logger.log(`Bulk created features: ${created} created, ${skipped} skipped`);
    return { created, skipped };
  }
}
