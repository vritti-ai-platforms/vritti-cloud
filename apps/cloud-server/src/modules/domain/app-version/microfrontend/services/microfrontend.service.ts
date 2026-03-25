import { Injectable, Logger } from '@nestjs/common';
import {
  ConflictException,
  CreateResponseDto,
  DataTableStateService,
  type FieldMap,
  FilterProcessor,
  NotFoundException,
  SuccessResponseDto,
} from '@vritti/api-sdk';
import { and, eq } from '@vritti/api-sdk/drizzle-orm';
import { microfrontends } from '@/db/schema';
import { MicrofrontendDto } from '@/modules/admin-api/app-version/microfrontend/dto/entity/microfrontend.dto';
import type { CreateMicrofrontendDto } from '@/modules/admin-api/app-version/microfrontend/dto/request/create-microfrontend.dto';
import type { UpdateMicrofrontendDto } from '@/modules/admin-api/app-version/microfrontend/dto/request/update-microfrontend.dto';
import type { MicrofrontendTableResponseDto } from '@/modules/admin-api/app-version/microfrontend/dto/response/microfrontend-table-response.dto';
import { MicrofrontendRepository } from '../repositories/microfrontend.repository';

@Injectable()
export class MicrofrontendService {
  private readonly logger = new Logger(MicrofrontendService.name);

  private static readonly FIELD_MAP: FieldMap = {
    code: { column: microfrontends.code, type: 'string' },
    name: { column: microfrontends.name, type: 'string' },
    platform: { column: microfrontends.platform, type: 'string' },
  };

  constructor(
    private readonly microfrontendRepository: MicrofrontendRepository,
    private readonly dataTableStateService: DataTableStateService,
  ) {}

  // Creates a new microfrontend; throws ConflictException on duplicate code+platform within version
  async create(dto: CreateMicrofrontendDto & { appVersionId: string }): Promise<CreateResponseDto<MicrofrontendDto>> {
    const existing = await this.microfrontendRepository.findByVersionAndCodeAndPlatform(
      dto.appVersionId,
      dto.code,
      dto.platform,
    );
    if (existing) {
      throw new ConflictException({
        label: 'Microfrontend Already Exists',
        detail: 'A microfrontend with this code and platform already exists in this version.',
        errors: [{ field: 'code', message: 'Duplicate code + platform' }],
      });
    }
    const microfrontend = await this.microfrontendRepository.create(dto);
    this.logger.log(`Created microfrontend: ${microfrontend.code} (${microfrontend.id})`);
    return { success: true, message: 'Microfrontend created successfully.', data: MicrofrontendDto.from(microfrontend) };
  }

  // Returns microfrontends for the data table filtered by app version
  async findForTable(userId: string, appVersionId: string): Promise<MicrofrontendTableResponseDto> {
    const { state, activeViewId } = await this.dataTableStateService.getCurrentState(userId, `microfrontends-${appVersionId}`);
    const filterWhere = FilterProcessor.buildWhere(state.filters, MicrofrontendService.FIELD_MAP);
    const searchWhere = FilterProcessor.buildSearch(state.search, MicrofrontendService.FIELD_MAP);
    const versionWhere = eq(microfrontends.appVersionId, appVersionId);
    const where = and(versionWhere, filterWhere, searchWhere);
    const orderBy = FilterProcessor.buildOrderBy(state.sort, MicrofrontendService.FIELD_MAP);
    const { limit = 20, offset = 0 } = state.pagination ?? {};
    const { result, count } = await this.microfrontendRepository.findAllAndCount({ where, orderBy, limit, offset });
    this.logger.log(`Fetched microfrontends table for version: ${appVersionId} (${count} results)`);
    return { result: result.map(MicrofrontendDto.from), count, state, activeViewId };
  }

  // Returns microfrontend options for a select component within a version
  async findForSelect(appVersionId: string, query?: string): Promise<{ options: Array<{ value: string; label: string }>; hasMore: boolean }> {
    this.logger.log(`Fetched microfrontend select options for version: ${appVersionId}`);
    return this.microfrontendRepository.findSelectOptions(appVersionId, {
      search: query,
      limit: 20,
      offset: 0,
    });
  }

  // Finds a microfrontend by ID; throws NotFoundException if not found
  async findById(id: string): Promise<MicrofrontendDto> {
    const microfrontend = await this.microfrontendRepository.findById(id);
    if (!microfrontend) {
      throw new NotFoundException('Microfrontend not found.');
    }
    this.logger.log(`Fetched microfrontend: ${id}`);
    return MicrofrontendDto.from(microfrontend);
  }

  // Updates a microfrontend by ID; checks uniqueness if code or platform changed
  async update(id: string, dto: UpdateMicrofrontendDto): Promise<SuccessResponseDto> {
    const existing = await this.microfrontendRepository.findById(id);
    if (!existing) {
      throw new NotFoundException('Microfrontend not found.');
    }
    if (dto.code || dto.platform) {
      const code = dto.code ?? existing.code;
      const platform = dto.platform ?? existing.platform;
      const duplicate = await this.microfrontendRepository.findByVersionAndCodeAndPlatform(
        existing.appVersionId,
        code,
        platform,
      );
      if (duplicate && duplicate.id !== id) {
        throw new ConflictException({
          label: 'Microfrontend Already Exists',
          detail: 'A microfrontend with this code and platform already exists in this version.',
          errors: [{ field: 'code', message: 'Duplicate code + platform' }],
        });
      }
    }
    const microfrontend = await this.microfrontendRepository.update(id, dto);
    this.logger.log(`Updated microfrontend: ${microfrontend.code} (${microfrontend.id})`);
    return { success: true, message: 'Microfrontend updated successfully.' };
  }

  // Deletes a microfrontend by ID; rejects if features reference it
  async delete(id: string): Promise<SuccessResponseDto> {
    const existing = await this.microfrontendRepository.findById(id);
    if (!existing) {
      throw new NotFoundException('Microfrontend not found.');
    }
    const refs = await this.microfrontendRepository.countFeatureReferences(id);
    if (refs > 0) {
      throw new ConflictException({
        label: 'Microfrontend In Use',
        detail: `Cannot delete "${existing.name}" — it is referenced by ${refs} feature${refs > 1 ? 's' : ''}. Remove those references first.`,
      });
    }
    await this.microfrontendRepository.delete(id);
    this.logger.log(`Deleted microfrontend: ${existing.name} (${existing.id})`);
    return { success: true, message: 'Microfrontend deleted successfully.' };
  }
}
