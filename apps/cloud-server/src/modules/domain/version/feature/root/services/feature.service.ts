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
import { type ExportFormat, buildExportBuffer } from '@vritti/api-sdk/xlsx';
import { and } from '@vritti/api-sdk/drizzle-orm';
import { type FeatureType, FeatureTypeValues, features, type NewFeaturePermission } from '@/db/schema';
import { FeatureDto } from '@/modules/admin-api/version/feature/root/dto/entity/feature.dto';
import { CreateFeatureDto } from '@/modules/admin-api/version/feature/root/dto/request/create-feature.dto';
import type { UpdateFeatureDto } from '@/modules/admin-api/version/feature/root/dto/request/update-feature.dto';
import { FeatureTableResponseDto } from '@/modules/admin-api/version/feature/root/dto/response/feature-table-response.dto';
import type { FeatureWithPermissionsResponseDto } from '@/modules/admin-api/version/feature/root/dto/response/feature-with-permissions-response.dto';
import { parseSpreadsheet } from '@/utils/parse-spreadsheet';
import { validateImportRows } from '@/utils/validate-import-rows';
import { FeaturePermissionRepository } from '../../feature-permission/repositories/feature-permission.repository';
import { FeatureRepository } from '../repositories/feature.repository';

const VALID_PERMISSIONS = Object.keys(FeatureTypeValues);

@Injectable()
export class FeatureService {
  private readonly logger = new Logger(FeatureService.name);

  private static readonly FIELD_MAP: FieldMap = {
    name: { column: features.name, type: 'string' },
    code: { column: features.code, type: 'string' },
  };

  constructor(
    private readonly featureRepository: FeatureRepository,
    private readonly featurePermissionRepository: FeaturePermissionRepository,
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
    return { success: true, message: 'Feature created successfully.', data: FeatureDto.from(feature) };
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
      result: result.map((r) => FeatureDto.from(r, r.appFeatureCount, r.permissions, r.platforms)),
      count,
      state,
      activeViewId,
    };
  }

  // Returns paginated feature options for the select component
  findForSelect(query: SelectOptionsQueryDto & { versionId?: string }): Promise<SelectQueryResult> {
    this.logger.log(
      `Fetched feature select options (limit: ${query.limit}, offset: ${query.offset}, search: ${query.search})`,
    );
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
      ...(query.versionId ? { where: { versionId: query.versionId } } : {}),
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
    return FeatureDto.from(feature, refs);
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
    return { success: true, message: `Feature "${existing.name}" deleted successfully.` };
  }

  // Validates and imports features from a spreadsheet buffer (all-or-nothing)
  async importFromFile(buffer: Buffer, versionId: string): Promise<ImportResponseDto> {
    const rows = parseSpreadsheet(buffer);
    const result = await validateImportRows(rows, CreateFeatureDto, { versionId });

    for (const row of result.rows) {
      if (!row.valid) continue;
      if (row.data.permissions) {
        const types = row.data.permissions.split(',').map((t) => t.trim().toUpperCase());
        const invalid = types.filter((t) => !VALID_PERMISSIONS.includes(t));
        if (invalid.length > 0) {
          row.valid = false;
          row.errors.push(`Invalid permission(s): ${invalid.join(', ')}. Valid: ${VALID_PERMISSIONS.join(', ')}`);
          result.summary.valid--;
          result.summary.invalid++;
        }
      }
    }

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
      let featureId: string;

      if (existing) {
        featureId = existing.id;
        let changed = false;

        // Check if feature fields changed
        const incomingDesc = row.data.description || null;
        if (existing.name !== row.data.name || existing.icon !== row.data.icon || existing.description !== incomingDesc) {
          await this.featureRepository.update(existing.id, {
            name: row.data.name,
            icon: row.data.icon,
            description: incomingDesc ?? undefined,
          } as UpdateFeatureDto);
          changed = true;
        }

        // Check if permissions changed
        if (row.data.permissions) {
          const incomingTypes = row.data.permissions.split(',').map((t) => t.trim().toUpperCase()).sort();
          const existingPerms = await this.featurePermissionRepository.findByFeatureId(featureId);
          const existingTypes = existingPerms.map((p) => p.type).sort();

          if (incomingTypes.join(',') !== existingTypes.join(',')) {
            const permissionRows: NewFeaturePermission[] = incomingTypes.map((type) => ({
              versionId,
              featureId,
              type: type as FeatureType,
            }));
            await this.featurePermissionRepository.transaction(async (tx) => {
              await this.featurePermissionRepository.deleteByFeatureId(featureId, tx);
              await this.featurePermissionRepository.bulkCreate(permissionRows, tx);
            });
            changed = true;
          }
        }

        if (changed) updated++;
        else skipped++;
      } else {
        const feature = await this.featureRepository.create({
          versionId,
          code: row.data.code,
          name: row.data.name,
          icon: row.data.icon,
          description: row.data.description || null,
        });
        featureId = feature.id;
        created++;

        if (row.data.permissions) {
          const types = row.data.permissions.split(',').map((t) => t.trim().toUpperCase());
          const permissionRows: NewFeaturePermission[] = types.map((type) => ({
            versionId,
            featureId,
            type: type as FeatureType,
          }));
          await this.featurePermissionRepository.bulkCreate(permissionRows);
        }
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
      permissions: r.permissions.join(','),
    }));

    this.logger.log(`Exported ${rows.length} feature(s) for version ${versionId} as ${format}`);
    return buildExportBuffer(rows, format);
  }

}
