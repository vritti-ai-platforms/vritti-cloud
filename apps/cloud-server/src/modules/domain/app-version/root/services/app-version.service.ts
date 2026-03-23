import { Injectable, Logger } from '@nestjs/common';
import {
  BadRequestException,
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
import { AppVersionStatusValues, appVersions } from '@/db/schema';
import { AppVersionDto } from '@/modules/admin-api/app-version/root/dto/entity/app-version.dto';
import type { CreateAppVersionDto } from '@/modules/admin-api/app-version/root/dto/request/create-app-version.dto';
import type { PushArtifactsDto } from '@/modules/admin-api/app-version/root/dto/request/push-artifacts.dto';
import type { UpdateAppVersionDto } from '@/modules/admin-api/app-version/root/dto/request/update-app-version.dto';
import type { AppVersionTableResponseDto } from '@/modules/admin-api/app-version/root/dto/response/app-version-table-response.dto';
import { AppVersionRepository } from '../repositories/app-version.repository';

@Injectable()
export class AppVersionService {
  private readonly logger = new Logger(AppVersionService.name);

  private static readonly FIELD_MAP: FieldMap = {
    version: { column: appVersions.version, type: 'string' },
    name: { column: appVersions.name, type: 'string' },
    status: { column: appVersions.status, type: 'string' },
  };

  constructor(
    private readonly appVersionRepository: AppVersionRepository,
    private readonly dataTableStateService: DataTableStateService,
  ) {}

  // Creates a new app version in DRAFT status; throws ConflictException on duplicate version
  async create(dto: CreateAppVersionDto): Promise<AppVersionDto> {
    const existing = await this.appVersionRepository.findByVersion(dto.version);
    if (existing) {
      throw new ConflictException({
        label: 'Version Already Exists',
        detail: 'An app version with this version string already exists. Please choose a different version.',
        errors: [{ field: 'version', message: 'Duplicate version' }],
      });
    }
    const appVersion = await this.appVersionRepository.create({
      ...dto,
      status: AppVersionStatusValues.DRAFT,
    });
    this.logger.log(`Created app version: ${appVersion.version} (${appVersion.id})`);
    return AppVersionDto.from(appVersion);
  }

  // Returns all app versions with server-stored filter/sort/search/pagination state applied
  async findForTable(userId: string): Promise<AppVersionTableResponseDto> {
    const { state, activeViewId } = await this.dataTableStateService.getCurrentState(userId, 'app-versions');
    const filterWhere = FilterProcessor.buildWhere(state.filters, AppVersionService.FIELD_MAP);
    const searchWhere = FilterProcessor.buildSearch(state.search, AppVersionService.FIELD_MAP);
    const where = and(filterWhere, searchWhere);
    const orderBy = FilterProcessor.buildOrderBy(state.sort, AppVersionService.FIELD_MAP);
    const { limit = 20, offset = 0 } = state.pagination ?? {};
    const { result, count } = await this.appVersionRepository.findAllAndCount({ where, orderBy, limit, offset });
    this.logger.log(`Fetched app versions table (${count} results, limit: ${limit}, offset: ${offset})`);
    return { result: result.map(AppVersionDto.from), count, state, activeViewId };
  }

  // Returns paginated app version options for the select component
  findForSelect(query: SelectOptionsQueryDto): Promise<SelectQueryResult> {
    this.logger.log(`Fetched app version select options (limit: ${query.limit}, offset: ${query.offset}, search: ${query.search})`);
    return this.appVersionRepository.findForSelect({
      value: query.valueKey || 'id',
      label: query.labelKey || 'name',
      description: query.descriptionKey || 'version',
      groupId: query.groupIdKey,
      search: query.search,
      limit: query.limit,
      offset: query.offset,
      values: query.values,
      excludeIds: query.excludeIds,
      orderBy: { name: 'asc' },
    });
  }

  // Finds an app version by ID; throws NotFoundException if not found
  async findById(id: string): Promise<AppVersionDto> {
    const appVersion = await this.appVersionRepository.findById(id);
    if (!appVersion) {
      throw new NotFoundException('App version not found.');
    }
    this.logger.log(`Fetched app version: ${id}`);
    return AppVersionDto.from(appVersion);
  }

  // Finalizes a DRAFT version by building a snapshot from all versioned tables
  async finalize(id: string): Promise<SuccessResponseDto> {
    const appVersion = await this.appVersionRepository.findById(id);
    if (!appVersion) {
      throw new NotFoundException('App version not found.');
    }
    if (appVersion.status !== AppVersionStatusValues.DRAFT) {
      throw new BadRequestException('Only DRAFT versions can be finalized.');
    }
    const snapshot = await this.appVersionRepository.buildSnapshot(id);
    await this.appVersionRepository.update(id, {
      snapshot,
      finalizedAt: new Date(),
    });
    this.logger.log(`Finalized app version: ${appVersion.version} (${id})`);
    return { success: true, message: 'App version finalized successfully.' };
  }

  // Stores CI artifacts and transitions a finalized version to READY
  async pushArtifacts(id: string, dto: PushArtifactsDto): Promise<SuccessResponseDto> {
    const appVersion = await this.appVersionRepository.findById(id);
    if (!appVersion) {
      throw new NotFoundException('App version not found.');
    }
    if (!appVersion.finalizedAt) {
      throw new BadRequestException('Version must be finalized before pushing artifacts.');
    }
    await this.appVersionRepository.update(id, {
      artifacts: dto.artifacts,
      status: AppVersionStatusValues.READY,
      readyAt: new Date(),
    });
    this.logger.log(`Pushed artifacts for app version: ${appVersion.version} (${id})`);
    return { success: true, message: 'Artifacts pushed and version marked as READY.' };
  }

  // Updates version name and/or version string; only DRAFT versions can be updated
  async update(id: string, dto: UpdateAppVersionDto): Promise<SuccessResponseDto> {
    const appVersion = await this.appVersionRepository.findById(id);
    if (!appVersion) throw new NotFoundException('App version not found.');
    if (appVersion.status !== AppVersionStatusValues.DRAFT) {
      throw new BadRequestException('Only DRAFT versions can be updated.');
    }
    if (dto.version && dto.version !== appVersion.version) {
      const existing = await this.appVersionRepository.findByVersion(dto.version);
      if (existing) {
        throw new ConflictException({
          label: 'Version Already Exists',
          detail: 'An app version with this version string already exists.',
          errors: [{ field: 'version', message: 'Duplicate version' }],
        });
      }
    }
    await this.appVersionRepository.update(id, dto);
    this.logger.log(`Updated app version: ${id}`);
    return { success: true, message: 'App version updated successfully.' };
  }

  // Deletes a DRAFT version; throws BadRequestException if not DRAFT
  async delete(id: string): Promise<SuccessResponseDto> {
    const appVersion = await this.appVersionRepository.findById(id);
    if (!appVersion) {
      throw new NotFoundException('App version not found.');
    }
    if (appVersion.status !== AppVersionStatusValues.DRAFT) {
      throw new BadRequestException('Only DRAFT versions can be deleted.');
    }
    await this.appVersionRepository.delete(id);
    this.logger.log(`Deleted app version: ${appVersion.version} (${id})`);
    return { success: true, message: 'App version deleted successfully.' };
  }
}
