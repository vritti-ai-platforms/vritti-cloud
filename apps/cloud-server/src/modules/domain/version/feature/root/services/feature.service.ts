import { Injectable, Logger } from '@nestjs/common';
import {
  ConflictException,
  CreateResponseDto,
  DataTableStateService,
  type FieldMap,
  FilterProcessor,
  ImportResponseDto,
  NotFoundException,
  SelectOptionsQueryDto,
  type SelectQueryResult,
  SuccessResponseDto,
} from '@vritti/api-sdk';
import { and } from '@vritti/api-sdk/drizzle-orm';
import { buildExportBuffer, type ExportFormat } from '@vritti/api-sdk/xlsx';
import { features } from '@/db/schema';
import { FeatureDto } from '@/modules/admin-api/version/feature/root/dto/entity/feature.dto';
import { CreateFeatureDto } from '@/modules/admin-api/version/feature/root/dto/request/create-feature.dto';
import type { UpdateFeatureDto } from '@/modules/admin-api/version/feature/root/dto/request/update-feature.dto';
import { FeatureTableResponseDto } from '@/modules/admin-api/version/feature/root/dto/response/feature-table-response.dto';
import { parseSpreadsheet } from '@/utils/parse-spreadsheet';
import { validateImportRows } from '@/utils/validate-import-rows';
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
    return {
      success: true,
      message: `Feature "${feature.name}" created successfully.`,
      data: FeatureDto.from(feature),
    };
  }

  // Returns all features with server-stored filter/sort/search/pagination state applied
  async findForTable(userId: string): Promise<FeatureTableResponseDto> {
    const { state, activeViewId } = await this.dataTableStateService.getCurrentState(userId, 'features');
    const filterWhere = FilterProcessor.buildWhere(state.filters, FeatureService.FIELD_MAP);
    const searchWhere = FilterProcessor.buildSearch(state.search, FeatureService.FIELD_MAP);
    const where = and(filterWhere, searchWhere);
    const orderBy = FilterProcessor.buildOrderBy(state.sort, FeatureService.FIELD_MAP);
    const { limit = 20, offset = 0 } = state.pagination ?? {};
    const { result, count } = await this.featureRepository.findAllForTable({ where, orderBy, limit, offset });
    this.logger.log(`Fetched features table (${count} results, limit: ${limit}, offset: ${offset})`);
    return {
      result: result.map((r) => FeatureDto.from(r, r.businessCount, r.permissions, r.platforms, r.appFeatureCount)),
      count,
      state,
      activeViewId,
    };
  }

  // Returns paginated feature options for the select component; when businessId is given, restricts to
  // features available to add to that business (applicable permission, not already assigned to its apps)
  findForSelect(
    query: SelectOptionsQueryDto & { versionId?: string; businessId?: string },
  ): Promise<SelectQueryResult> {
    this.logger.log(
      `Fetched feature select options (limit: ${query.limit}, offset: ${query.offset}, search: ${query.search})`,
    );
    const config = {
      value: query.valueKey || 'id',
      label: query.labelKey || 'name',
      description: query.descriptionKey,
      groupIdKey: query.groupIdKey,
      search: query.search,
      limit: query.limit,
      offset: query.offset,
      values: query.values,
      excludeIds: query.excludeIds,
      orderBy: { name: 'asc' as const },
      ...(query.versionId ? { where: { versionId: query.versionId } } : {}),
    };
    if (query.businessId) {
      return this.featureRepository.findForSelectForBusiness(config, query.businessId);
    }
    return this.featureRepository.findForSelect(config);
  }

  // Finds a feature by ID; throws NotFoundException if not found
  async findById(id: string): Promise<FeatureDto> {
    const feature = await this.featureRepository.findById(id);
    if (!feature) {
      throw new NotFoundException('Feature not found.');
    }
    const refs = await this.featureRepository.countAppFeatureReferences(id);
    this.logger.log(`Fetched feature: ${id}`);
    return FeatureDto.from(feature, 0, [], [], refs);
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
    return { success: true, message: `Feature "${existing.name}" updated successfully.` };
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
    return { success: true, message: `Feature "${existing.name}" deleted successfully.` };
  }

  // Validates and imports features from a spreadsheet buffer (all-or-nothing). Permissions are authored separately.
  async importFromFile(buffer: Buffer, versionId: string): Promise<ImportResponseDto> {
    const rows = parseSpreadsheet(buffer);
    const result = await validateImportRows(rows, CreateFeatureDto, { versionId });

    if (result.summary.invalid > 0) {
      this.logger.log(
        `Feature import validation failed: ${result.summary.valid} valid, ${result.summary.invalid} invalid`,
      );
      return { success: false, message: 'Validation failed.', rows: result.rows, summary: result.summary };
    }

    let created = 0;
    let updated = 0;
    let skipped = 0;
    for (const row of result.rows) {
      const existing = await this.featureRepository.findByCode(row.data.code);

      if (existing) {
        const incomingDesc = row.data.description || null;
        if (
          existing.name !== row.data.name ||
          existing.icon !== row.data.icon ||
          existing.description !== incomingDesc
        ) {
          await this.featureRepository.update(existing.id, {
            name: row.data.name,
            icon: row.data.icon,
            description: incomingDesc ?? undefined,
          } as UpdateFeatureDto);
          updated++;
        } else {
          skipped++;
        }
      } else {
        await this.featureRepository.create({
          versionId,
          code: row.data.code,
          name: row.data.name,
          icon: row.data.icon,
          description: row.data.description || null,
        });
        created++;
      }
    }

    this.logger.log(`Imported features for version ${versionId}: ${created} created, ${updated} updated`);
    return { success: true, message: 'Import complete.', created, updated, skipped };
  }

  // Exports all features for a version as an Excel buffer
  async exportToBuffer(versionId: string, format: ExportFormat = 'xlsx'): Promise<Buffer> {
    const result = await this.featureRepository.findAllForExport(versionId);

    const rows = result.map((r) => ({
      code: r.code,
      name: r.name,
      icon: r.icon,
      description: r.description ?? '',
    }));

    this.logger.log(`Exported ${rows.length} feature(s) for version ${versionId} as ${format}`);
    return buildExportBuffer(rows, format);
  }
}
