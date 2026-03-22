import { Injectable, Logger } from '@nestjs/common';
import {
  ConflictException,
  DataTableStateService,
  type FieldMap,
  FilterProcessor,
  NotFoundException,
  SelectOptionsQueryDto,
  type SelectQueryResult,
  SuccessResponseDto,
} from '@vritti/api-sdk';
import { and } from '@vritti/api-sdk/drizzle-orm';
import { apps } from '@/db/schema';
import { AppDto } from '../dto/entity/app.dto';
import type { CreateAppDto } from '../dto/request/create-app.dto';
import type { UpdateAppDto } from '../dto/request/update-app.dto';
import { AppTableResponseDto } from '../dto/response/app-table-response.dto';
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
  async create(dto: CreateAppDto): Promise<AppDto> {
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
    return AppDto.from(app);
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
    const result = rows.map((row) => AppDto.from(row, row.featureCount, row.planCount));
    this.logger.log(`Fetched apps table (${total} results, limit: ${limit}, offset: ${offset})`);
    return { result, count: total, state, activeViewId };
  }

  // Returns paginated app options for the select component
  findForSelect(query: SelectOptionsQueryDto): Promise<SelectQueryResult> {
    this.logger.log(
      `Fetched app select options (limit: ${query.limit}, offset: ${query.offset}, search: ${query.search})`,
    );
    return this.appRepository.findForSelect({
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

  // Finds an app by ID with counts; throws NotFoundException if not found
  async findById(id: string): Promise<AppDto> {
    const row = await this.appRepository.findOneWithCounts(id);
    if (!row) {
      throw new NotFoundException('App not found.');
    }
    this.logger.log(`Fetched app: ${id}`);
    return AppDto.from(row, row.featureCount, row.planCount);
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
    return { success: true, message: 'App updated successfully.' };
  }

  // Deletes an app by ID; rejects if referenced by any plan_apps or industry_apps
  async delete(id: string): Promise<SuccessResponseDto> {
    const existing = await this.appRepository.findById(id);
    if (!existing) {
      throw new NotFoundException('App not found.');
    }
    const [planRefs, industryRefs] = await Promise.all([
      this.appRepository.countPlanReferences(existing.code),
      this.appRepository.countIndustryReferences(id),
    ]);
    const parts: string[] = [];
    if (planRefs > 0) parts.push(`${planRefs} plan${planRefs > 1 ? 's' : ''}`);
    if (industryRefs > 0) parts.push(`${industryRefs} industr${industryRefs > 1 ? 'ies' : 'y'}`);
    if (parts.length > 0) {
      throw new ConflictException({
        label: 'App In Use',
        detail: `Cannot delete "${existing.name}" — it is referenced by ${parts.join(' and ')}. Remove those references first.`,
      });
    }
    await this.appRepository.delete(id);
    this.logger.log(`Deleted app: ${existing.name} (${existing.id})`);
    return { success: true, message: 'App deleted successfully.' };
  }
}
