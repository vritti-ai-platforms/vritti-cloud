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
import { apps } from '@/db/schema';
import { AppDto } from '@/modules/admin-api/version/app/root/dto/entity/app.dto';
import { CreateAppDto } from '@/modules/admin-api/version/app/root/dto/request/create-app.dto';
import type { UpdateAppDto } from '@/modules/admin-api/version/app/root/dto/request/update-app.dto';
import { AppTableResponseDto } from '@/modules/admin-api/version/app/root/dto/response/app-table-response.dto';
import { parseSpreadsheet } from '@/utils/parse-spreadsheet';
import { validateImportRows } from '@/utils/validate-import-rows';
import { AppRepository } from '../repositories/app.repository';

@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);

  private static readonly FIELD_MAP: FieldMap = {
    name: { column: apps.name, type: 'string' },
    code: { column: apps.code, type: 'string' },
  };

  constructor(
    private readonly appRepository: AppRepository,
    private readonly dataTableStateService: DataTableStateService,
  ) {}

  // Creates a new app; throws ConflictException on duplicate code
  async create(dto: CreateAppDto): Promise<CreateResponseDto<AppDto>> {
    const existing = await this.appRepository.findByCode(dto.code);
    if (existing) {
      throw new ConflictException({
        label: 'Code Already Exists',
        detail: 'An app with this code already exists. Please choose a different code.',
        errors: [{ field: 'code', message: 'Duplicate code' }],
      });
    }
    const app = await this.appRepository.create(dto);
    this.logger.log(`Created app: ${app.name} (${app.id})`);
    return { success: true, message: `App "${app.name}" created successfully.`, data: AppDto.from(app) };
  }

  // Returns all apps with counts, applying server-stored filter/sort/search/pagination state
  async findForTable(userId: string): Promise<AppTableResponseDto> {
    const { state, activeViewId } = await this.dataTableStateService.getCurrentState(userId, 'apps');
    const filterWhere = FilterProcessor.buildWhere(state.filters, AppService.FIELD_MAP);
    const searchWhere = FilterProcessor.buildSearch(state.search, AppService.FIELD_MAP);
    const where = and(filterWhere, searchWhere);
    const orderBy = FilterProcessor.buildOrderBy(state.sort, AppService.FIELD_MAP);
    const { limit = 20, offset = 0 } = state.pagination ?? {};
    const { rows, total } = await this.appRepository.findAllWithCounts(where, orderBy, limit, offset);
    const result = rows.map((row) => AppDto.from(row, row.featureCount, row.planCount, row.roleCount));
    this.logger.log(`Fetched apps table (${total} results, limit: ${limit}, offset: ${offset})`);
    return { result, count: total, state, activeViewId };
  }

  // Returns paginated app options for the select component
  findForSelect(query: SelectOptionsQueryDto & { versionId?: string }): Promise<SelectQueryResult> {
    this.logger.log(
      `Fetched app select options (limit: ${query.limit}, offset: ${query.offset}, search: ${query.search})`,
    );
    return this.appRepository.findForSelect({
      value: query.valueKey || 'id',
      label: query.labelKey || 'name',
      description: query.descriptionKey,
      groupIdKey: query.groupIdKey,
      search: query.search,
      limit: query.limit,
      offset: query.offset,
      values: query.values,
      excludeIds: query.excludeIds,
      orderBy: { name: 'asc' },
      ...(query.versionId ? { where: { versionId: query.versionId } } : {}),
    });
  }

  // Finds an app by ID with counts; throws NotFoundException if not found
  async findById(id: string): Promise<AppDto> {
    const row = await this.appRepository.findOneWithCounts(id);
    if (!row) {
      throw new NotFoundException('App not found.');
    }
    this.logger.log(`Fetched app: ${id}`);
    return AppDto.from(row, row.featureCount, row.planCount, row.roleCount);
  }

  // Updates an app by ID; throws NotFoundException if not found, ConflictException on duplicate code
  async update(id: string, dto: UpdateAppDto): Promise<SuccessResponseDto> {
    const existing = await this.appRepository.findById(id);
    if (!existing) {
      throw new NotFoundException('App not found.');
    }
    if (dto.code) {
      const existingCode = await this.appRepository.findByCode(dto.code);
      if (existingCode && existingCode.id !== id) {
        throw new ConflictException({
          label: 'Code Already Exists',
          detail: 'An app with this code already exists. Please choose a different code.',
          errors: [{ field: 'code', message: 'Duplicate code' }],
        });
      }
    }
    const app = await this.appRepository.update(id, dto);
    this.logger.log(`Updated app: ${app.name} (${app.id})`);
    return { success: true, message: `App "${existing.name}" updated successfully.` };
  }

  // Deletes an app by ID; rejects if referenced by any plan_apps or industry_apps
  async delete(id: string): Promise<SuccessResponseDto> {
    const existing = await this.appRepository.findById(id);
    if (!existing) {
      throw new NotFoundException('App not found.');
    }
    const [planRefs, industryRefs, roleRefs] = await Promise.all([
      this.appRepository.countPlanReferences(existing.code),
      this.appRepository.countIndustryReferences(existing.code),
      this.appRepository.countRoleTemplateReferences(existing.id),
    ]);
    const parts: string[] = [];
    if (planRefs > 0) parts.push(`${planRefs} plan${planRefs > 1 ? 's' : ''}`);
    if (industryRefs > 0) parts.push(`${industryRefs} industr${industryRefs > 1 ? 'ies' : 'y'}`);
    if (roleRefs > 0) parts.push(`${roleRefs} role template${roleRefs > 1 ? 's' : ''}`);
    if (parts.length > 0) {
      throw new ConflictException({
        label: 'App In Use',
        detail: `Cannot delete "${existing.name}" — it is referenced by ${parts.join(' and ')}. Remove those references first.`,
      });
    }
    await this.appRepository.delete(id);
    this.logger.log(`Deleted app: ${existing.name} (${existing.id})`);
    return { success: true, message: `App "${existing.name}" deleted successfully.` };
  }

  // Validates and imports apps from a spreadsheet buffer (all-or-nothing)
  async importFromFile(buffer: Buffer, versionId: string): Promise<ImportResponseDto> {
    const rows = parseSpreadsheet(buffer);
    const result = await validateImportRows(rows, CreateAppDto, { versionId });

    for (const row of result.rows) {
      if (!row.valid) continue;
      const existing = await this.appRepository.findByCode(row.data.code);
      if (existing) {
        row.valid = false;
        row.errors.push('Code already exists');
        result.summary.valid--;
        result.summary.invalid++;
      }
    }

    if (result.summary.invalid > 0) {
      this.logger.log(`App import validation failed: ${result.summary.valid} valid, ${result.summary.invalid} invalid`);
      return { success: false, message: 'Validation failed.', rows: result.rows, summary: result.summary };
    }

    let created = 0;
    let updated = 0;
    for (const row of result.rows) {
      const existing = await this.appRepository.findByCode(row.data.code);
      if (existing) {
        await this.appRepository.update(existing.id, {
          name: row.data.name,
          icon: row.data.icon,
          description: row.data.description || undefined,
        } as UpdateAppDto);
        updated++;
      } else {
        await this.appRepository.create(row.data as unknown as CreateAppDto);
        created++;
      }
    }

    this.logger.log(`Imported apps for version ${versionId}: ${created} created, ${updated} updated`);
    return { success: true, message: 'Import complete.', created, updated };
  }

  // Exports all apps for a version as an Excel buffer
  async exportToBuffer(versionId: string, format: ExportFormat = 'xlsx'): Promise<Buffer> {
    const allApps = await this.appRepository.findAllByVersionId(versionId);

    const rows = allApps.map((app) => ({
      code: app.code,
      name: app.name,
      icon: app.icon,
      description: app.description ?? '',
    }));

    this.logger.log(`Exported ${rows.length} app(s) for version ${versionId}`);
    return buildExportBuffer(rows, format);
  }
}
