import { Injectable, Logger } from '@nestjs/common';
import { DataTableStateService } from '@vritti/api-sdk/data-table';
import {
  CreateResponseDto,
  type FieldMap,
  FilterProcessor,
  type SelectQueryResult,
  SuccessResponseDto,
} from '@vritti/api-sdk/database';
import { and, eq } from '@vritti/api-sdk/drizzle-orm';
import { ConflictException } from '@vritti/api-sdk/exceptions';
import { type AppPlatform, microfrontends } from '@/db/schema';
import { MicrofrontendDto } from '@/modules/admin-api/version/microfrontend/dto/entity/microfrontend.dto';
import type { MobileMicrofrontendBodyDto } from '@/modules/admin-api/version/microfrontend/dto/request/mobile-microfrontend-body.dto';
import type { WebMicrofrontendBodyDto } from '@/modules/admin-api/version/microfrontend/dto/request/web-microfrontend-body.dto';
import type { MicrofrontendTableResponseDto } from '@/modules/admin-api/version/microfrontend/dto/response/microfrontend-table-response.dto';
import type { MicrofrontendSelectQueryDto } from '@/modules/select-api/dto/microfrontend-select-query.dto';
import { MicrofrontendRepository } from '../repositories/microfrontend.repository';

// The URL platform param, lowercase
export type MicrofrontendPlatformParam = 'web' | 'mobile';

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

  // Returns microfrontends for the data table filtered by app version (reads the unified view)
  async findForTable(userId: string, versionId: string): Promise<MicrofrontendTableResponseDto> {
    const { state, activeViewId } = await this.dataTableStateService.getCurrentState(
      userId,
      `microfrontends-${versionId}`,
    );
    const filterWhere = FilterProcessor.buildWhere(state.filters, MicrofrontendService.FIELD_MAP);
    const searchWhere = FilterProcessor.buildSearch(state.search, MicrofrontendService.FIELD_MAP);
    const versionWhere = eq(microfrontends.versionId, versionId);
    const where = and(versionWhere, filterWhere, searchWhere);
    const orderBy = FilterProcessor.buildOrderBy(state.sort, MicrofrontendService.FIELD_MAP);
    const { limit = 20, offset = 0 } = state.pagination ?? {};
    const { result, count } = await this.microfrontendRepository.findAllAndCount({ where, orderBy, limit, offset });
    this.logger.log(`Fetched microfrontends table for version: ${versionId} (${count} results)`);
    return { result: result.map(MicrofrontendDto.from), count, state, activeViewId };
  }

  // Returns microfrontend options for a select component, optionally grouped by version
  findForSelect(query: MicrofrontendSelectQueryDto): Promise<SelectQueryResult> {
    this.logger.log(
      `Fetched microfrontend select options (limit: ${query.limit}, offset: ${query.offset}, search: ${query.search})`,
    );
    return this.microfrontendRepository.findMicrofrontendSelectOptions(query);
  }

  // Upserts a web microfrontend (PUT semantics) keyed by (versionId, code)
  async upsertWeb(versionId: string, dto: WebMicrofrontendBodyDto): Promise<CreateResponseDto<MicrofrontendDto>> {
    const row = await this.microfrontendRepository.upsertWeb({
      versionId,
      code: dto.code,
      name: dto.name,
      remoteEntry: dto.remoteEntry,
    });
    this.logger.log(`Upserted web microfrontend: ${row.code} (${row.id})`);
    return {
      success: true,
      message: `Microfrontend "${row.name}" saved successfully.`,
      data: MicrofrontendDto.from({
        id: row.id,
        versionId: row.versionId,
        code: row.code,
        name: row.name,
        platform: 'WEB',
        remoteEntry: row.remoteEntry,
        remoteEntryAndroid: null,
        remoteEntryIos: null,
      }),
    };
  }

  // Upserts a mobile microfrontend (PUT semantics) keyed by (versionId, code)
  async upsertMobile(versionId: string, dto: MobileMicrofrontendBodyDto): Promise<CreateResponseDto<MicrofrontendDto>> {
    const row = await this.microfrontendRepository.upsertMobile({
      versionId,
      code: dto.code,
      name: dto.name,
      remoteEntryAndroid: dto.remoteEntryAndroid,
      remoteEntryIos: dto.remoteEntryIos,
    });
    this.logger.log(`Upserted mobile microfrontend: ${row.code} (${row.id})`);
    return {
      success: true,
      message: `Microfrontend "${row.name}" saved successfully.`,
      data: MicrofrontendDto.from({
        id: row.id,
        versionId: row.versionId,
        code: row.code,
        name: row.name,
        platform: 'MOBILE',
        remoteEntry: null,
        remoteEntryAndroid: row.remoteEntryAndroid,
        remoteEntryIos: row.remoteEntryIos,
      }),
    };
  }

  // Deletes a microfrontend by ID; rejects if features reference it
  async remove(platform: MicrofrontendPlatformParam, id: string): Promise<SuccessResponseDto> {
    const appPlatform: AppPlatform = platform === 'web' ? 'WEB' : 'MOBILE';
    const refs = await this.microfrontendRepository.countFeatureReferences(id, appPlatform);
    if (refs > 0) {
      throw new ConflictException({
        label: 'Microfrontend In Use',
        detail: `It is referenced by ${refs} feature${refs > 1 ? 's' : ''}. Unlink those features first.`,
      });
    }
    await this.microfrontendRepository.remove(appPlatform, id);
    this.logger.log(`Deleted ${appPlatform} microfrontend: ${id}`);
    return { success: true, message: 'Microfrontend deleted successfully.' };
  }
}
