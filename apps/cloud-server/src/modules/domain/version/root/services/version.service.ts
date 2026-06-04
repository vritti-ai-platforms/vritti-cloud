import { Injectable, Logger } from '@nestjs/common';
import {
  BadRequestException,
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
import _ from '@vritti/api-sdk/lodash';
import { VersionStatusValues, versions } from '@/db/schema';
import { VersionDto } from '@/modules/admin-api/version/root/dto/entity/version.dto';
import type { CreateVersionDto } from '@/modules/admin-api/version/root/dto/request/create-version.dto';
import type { PushArtifactsDto } from '@/modules/admin-api/version/root/dto/request/push-artifacts.dto';
import type { UpdateVersionDto } from '@/modules/admin-api/version/root/dto/request/update-version.dto';
import type { VersionTableResponseDto } from '@/modules/admin-api/version/root/dto/response/version-table-response.dto';
import { VersionRepository } from '../repositories/version.repository';

@Injectable()
export class VersionService {
  private readonly logger = new Logger(VersionService.name);

  private static readonly FIELD_MAP: FieldMap = {
    version: { column: versions.version, type: 'string' },
    name: { column: versions.name, type: 'string' },
    status: { column: versions.status, type: 'string' },
  };

  constructor(
    private readonly versionRepository: VersionRepository,
    private readonly dataTableStateService: DataTableStateService,
  ) {}

  // Creates a new version in ALPHA status; throws ConflictException on duplicate version
  async create(dto: CreateVersionDto): Promise<CreateResponseDto<VersionDto>> {
    const existing = await this.versionRepository.findByVersion(dto.version);
    if (existing) {
      throw new ConflictException({
        label: 'Version Already Exists',
        detail: 'A version with this version string already exists. Please choose a different version.',
        errors: [{ field: 'version', message: 'Duplicate version' }],
      });
    }
    const version = await this.versionRepository.create({
      ...dto,
      status: VersionStatusValues.ALPHA,
    });
    this.logger.log(`Created version: ${version.version} (${version.id})`);
    return {
      success: true,
      message: `Version "${version.name}" created successfully.`,
      data: VersionDto.from(version),
    };
  }

  // Returns all versions with server-stored filter/sort/search/pagination state applied
  async findForTable(userId: string): Promise<VersionTableResponseDto> {
    const { state, activeViewId } = await this.dataTableStateService.getCurrentState(userId, 'versions');
    const filterWhere = FilterProcessor.buildWhere(state.filters, VersionService.FIELD_MAP);
    const searchWhere = FilterProcessor.buildSearch(state.search, VersionService.FIELD_MAP);
    const where = and(filterWhere, searchWhere);
    const orderBy = FilterProcessor.buildOrderBy(state.sort, VersionService.FIELD_MAP);
    const { limit = 20, offset = 0 } = state.pagination ?? {};
    const { result, count } = await this.versionRepository.findAllAndCount({ where, orderBy, limit, offset });
    this.logger.log(`Fetched versions table (${count} results, limit: ${limit}, offset: ${offset})`);
    return { result: result.map((v) => VersionDto.from(v)), count, state, activeViewId };
  }

  // Returns paginated version options for the select component
  findForSelect(query: SelectOptionsQueryDto): Promise<SelectQueryResult> {
    this.logger.log(
      `Fetched version select options (limit: ${query.limit}, offset: ${query.offset}, search: ${query.search})`,
    );
    return this.versionRepository.findForSelect({
      value: query.valueKey || 'id',
      label: query.labelKey || 'name',
      description: query.descriptionKey || 'version',
      groupIdKey: query.groupIdKey,
      search: query.search,
      limit: query.limit,
      offset: query.offset,
      values: query.values,
      excludeIds: query.excludeIds,
      orderBy: { name: 'asc' },
    });
  }

  // Finds a version by ID; throws NotFoundException if not found
  async findById(id: string): Promise<VersionDto> {
    const version = await this.versionRepository.findById(id);
    if (!version) {
      throw new NotFoundException('Version not found.');
    }
    let isSnapshotStale = false;
    if (version.snapshot) {
      const currentSnapshot = await this.versionRepository.buildSnapshot(id);
      isSnapshotStale = !_.isEqual(version.snapshot, currentSnapshot);
    }
    this.logger.log(`Fetched version: ${id} (snapshotStale: ${isSnapshotStale})`);
    return VersionDto.from(version, { isSnapshotStale });
  }

  // Builds a snapshot from all versioned tables and stores it on the version
  async createSnapshot(id: string): Promise<SuccessResponseDto> {
    const version = await this.versionRepository.findById(id);
    if (!version) {
      throw new NotFoundException('Version not found.');
    }
    const snapshot = await this.versionRepository.buildSnapshot(id);
    await this.versionRepository.update(id, { snapshot });
    this.logger.log(`Created snapshot for version: ${version.version} (${id})`);
    return { success: true, message: `Snapshot created for "${version.name}" (${version.version}).` };
  }

  // Stores CI artifacts on a version
  async pushArtifacts(id: string, dto: PushArtifactsDto): Promise<SuccessResponseDto> {
    const version = await this.versionRepository.findById(id);
    if (!version) {
      throw new NotFoundException('Version not found.');
    }
    await this.versionRepository.update(id, { artifacts: dto.artifacts });
    this.logger.log(`Pushed artifacts for version: ${version.version} (${id})`);
    return { success: true, message: `Artifacts pushed for "${version.name}" (${version.version}).` };
  }

  // Updates version name and/or version string
  async update(id: string, dto: UpdateVersionDto): Promise<SuccessResponseDto> {
    const version = await this.versionRepository.findById(id);
    if (!version) throw new NotFoundException('Version not found.');
    if (dto.version && dto.version !== version.version) {
      const existing = await this.versionRepository.findByVersion(dto.version);
      if (existing) {
        throw new ConflictException({
          label: 'Version Already Exists',
          detail: 'A version with this version string already exists.',
          errors: [{ field: 'version', message: 'Duplicate version' }],
        });
      }
    }
    await this.versionRepository.update(id, dto);
    this.logger.log(`Updated version: ${id}`);
    return { success: true, message: `Version "${version.name}" updated successfully.` };
  }

  // Deletes a version; PROD versions cannot be deleted
  async delete(id: string): Promise<SuccessResponseDto> {
    const version = await this.versionRepository.findById(id);
    if (!version) {
      throw new NotFoundException('Version not found.');
    }
    if (version.status === VersionStatusValues.PROD) {
      throw new BadRequestException('PROD versions cannot be deleted.');
    }
    await this.versionRepository.delete(id);
    this.logger.log(`Deleted version: ${version.version} (${id})`);
    return { success: true, message: `Version "${version.name}" deleted successfully.` };
  }
}
