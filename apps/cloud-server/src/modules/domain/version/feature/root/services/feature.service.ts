import { Injectable, Logger } from '@nestjs/common';
import { DataTableStateService } from '@vritti/api-sdk/data-table';
import {
  CreateResponseDto,
  type FieldMap,
  FilterProcessor,
  ImportResponseDto,
  SelectOptionsQueryDto,
  type SelectQueryResult,
  SuccessResponseDto,
} from '@vritti/api-sdk/database';
import { and, sql } from '@vritti/api-sdk/drizzle-orm';
import { ConflictException, NotFoundException } from '@vritti/api-sdk/exceptions';
import { buildExportBuffer, type ExportFormat } from '@vritti/api-sdk/xlsx';
import { businessAppFeatures, features } from '@/db/schema';
import { FeatureDto } from '@/modules/admin-api/version/feature/root/dto/entity/feature.dto';
import { FeatureMicrofrontendLinksDto } from '@/modules/admin-api/version/feature/root/dto/entity/feature-microfrontend-links.dto';
import { CreateFeatureDto } from '@/modules/admin-api/version/feature/root/dto/request/create-feature.dto';
import type { SetFeatureMicrofrontendDto } from '@/modules/admin-api/version/feature/root/dto/request/set-feature-microfrontend.dto';
import type { UpdateFeatureDto } from '@/modules/admin-api/version/feature/root/dto/request/update-feature.dto';
import { FeatureTableResponseDto } from '@/modules/admin-api/version/feature/root/dto/response/feature-table-response.dto';
import { parseSpreadsheet } from '@/utils/parse-spreadsheet';
import { validateImportRows } from '@/utils/validate-import-rows';
import { MicrofrontendRepository } from '../../../microfrontend/repositories/microfrontend.repository';
import { FeatureRepository } from '../repositories/feature.repository';

export type FeatureMicrofrontendPlatformParam = 'web' | 'mobile';

@Injectable()
export class FeatureService {
  private readonly logger = new Logger(FeatureService.name);

  private static readonly FIELD_MAP: FieldMap = {
    name: { column: features.name, type: 'string' },
    code: { column: features.code, type: 'string' },
    // Filter by business assignment via EXISTS; honour the operator so "is not" (notEquals / isNotAnyOf) negates to features NOT assigned to the business
    businessId: {
      expression: (value, operator) => {
        const exists = sql`EXISTS (SELECT 1 FROM ${businessAppFeatures} WHERE ${businessAppFeatures.featureId} = ${features.id} AND ${businessAppFeatures.businessId} = ${value}::uuid)`;
        return operator === 'notEquals' || operator === 'isNotAnyOf' ? sql`NOT ${exists}` : exists;
      },
      type: 'string',
    },
  };

  constructor(
    private readonly featureRepository: FeatureRepository,
    private readonly microfrontendRepository: MicrofrontendRepository,
    private readonly dataTableStateService: DataTableStateService,
  ) {}

  // Links a microfrontend to a feature on the given platform (sets the feature's web/mobile link columns)
  async setMicrofrontend(
    featureId: string,
    platform: FeatureMicrofrontendPlatformParam,
    dto: SetFeatureMicrofrontendDto,
  ): Promise<CreateResponseDto<FeatureDto>> {
    const feature = await this.featureRepository.findById(featureId);
    if (!feature) {
      throw new NotFoundException('Feature not found.');
    }
    if (platform === 'web') {
      const mf = await this.microfrontendRepository.findWebById(dto.microfrontendId);
      if (!mf) {
        throw new NotFoundException('Web microfrontend not found.');
      }
      const updated = await this.featureRepository.setWebMicrofrontend(featureId, {
        webMfId: dto.microfrontendId,
        webExposedModule: dto.exposedModule,
        webRoutePrefix: dto.routePrefix,
      });
      this.logger.log(`Linked web microfrontend ${dto.microfrontendId} to feature: ${featureId}`);
      return {
        success: true,
        message: `Microfrontend "${mf.name}" linked to "${feature.name}" successfully.`,
        data: FeatureDto.from(updated),
      };
    }
    const mf = await this.microfrontendRepository.findMobileById(dto.microfrontendId);
    if (!mf) {
      throw new NotFoundException('Mobile microfrontend not found.');
    }
    const updated = await this.featureRepository.setMobileMicrofrontend(featureId, {
      mobileMfId: dto.microfrontendId,
      mobileExposedModule: dto.exposedModule,
      mobileRoutePrefix: dto.routePrefix,
    });
    this.logger.log(`Linked mobile microfrontend ${dto.microfrontendId} to feature: ${featureId}`);
    return {
      success: true,
      message: `Microfrontend "${mf.name}" linked to "${feature.name}" successfully.`,
      data: FeatureDto.from(updated),
    };
  }

  // Removes a feature's microfrontend link for the given platform (clears the web/mobile link columns)
  async removeMicrofrontend(
    featureId: string,
    platform: FeatureMicrofrontendPlatformParam,
  ): Promise<SuccessResponseDto> {
    const feature = await this.featureRepository.findById(featureId);
    if (!feature) {
      throw new NotFoundException('Feature not found.');
    }
    if (platform === 'web') {
      await this.featureRepository.clearWebMicrofrontend(featureId);
    } else {
      await this.featureRepository.clearMobileMicrofrontend(featureId);
    }
    this.logger.log(`Removed ${platform} microfrontend link from feature: ${featureId}`);
    return { success: true, message: `Microfrontend link removed from "${feature.name}" successfully.` };
  }

  // Returns a feature's microfrontend links keyed by platform (the per-feature admin tab source)
  async getMicrofrontends(featureId: string): Promise<FeatureMicrofrontendLinksDto> {
    const feature = await this.featureRepository.findById(featureId);
    if (!feature) {
      throw new NotFoundException('Feature not found.');
    }
    const links = new FeatureMicrofrontendLinksDto();
    links.web = null;
    links.mobile = null;
    if (feature.webMfId && feature.webExposedModule && feature.webRoutePrefix) {
      const mf = await this.microfrontendRepository.findWebById(feature.webMfId);
      if (mf) {
        links.web = {
          microfrontendId: mf.id,
          code: mf.code,
          name: mf.name,
          remoteEntry: mf.remoteEntry,
          exposedModule: feature.webExposedModule,
          routePrefix: feature.webRoutePrefix,
        };
      }
    }
    if (feature.mobileMfId && feature.mobileExposedModule && feature.mobileRoutePrefix) {
      const mf = await this.microfrontendRepository.findMobileById(feature.mobileMfId);
      if (mf) {
        links.mobile = {
          microfrontendId: mf.id,
          code: mf.code,
          name: mf.name,
          remoteEntryAndroid: mf.remoteEntryAndroid,
          remoteEntryIos: mf.remoteEntryIos,
          exposedModule: feature.mobileExposedModule,
          routePrefix: feature.mobileRoutePrefix,
        };
      }
    }
    this.logger.log(`Fetched microfrontend links for feature: ${featureId}`);
    return links;
  }

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

  // Returns paginated feature select options; when businessId is given, restricts to features addable to that business
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
          existing.lucideIcon !== row.data.lucideIcon ||
          existing.sfSymbol !== row.data.sfSymbol ||
          existing.materialSymbol !== row.data.materialSymbol ||
          existing.description !== incomingDesc
        ) {
          const changes: UpdateFeatureDto = {
            name: row.data.name,
            lucideIcon: row.data.lucideIcon,
            sfSymbol: row.data.sfSymbol,
            materialSymbol: row.data.materialSymbol,
            description: incomingDesc ?? undefined,
          };
          await this.featureRepository.update(existing.id, changes);
          updated++;
        } else {
          skipped++;
        }
      } else {
        await this.featureRepository.create({
          versionId,
          code: row.data.code,
          name: row.data.name,
          lucideIcon: row.data.lucideIcon,
          sfSymbol: row.data.sfSymbol,
          materialSymbol: row.data.materialSymbol,
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
      lucideIcon: r.lucideIcon,
      description: r.description ?? '',
    }));

    this.logger.log(`Exported ${rows.length} feature(s) for version ${versionId} as ${format}`);
    return buildExportBuffer(rows, format);
  }
}
