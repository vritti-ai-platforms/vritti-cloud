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
import { and } from '@vritti/api-sdk/drizzle-orm';
import { featurePermissions } from '@/db/schema';
import type { BusinessPermissionTableResponseDto } from '@/modules/admin-api/version/business/permission/dto/response/business-permission-table-response.dto';
import { FeaturePermissionDto } from '@/modules/admin-api/version/permission/dto/entity/feature-permission.dto';
import type { BulkCreatePermissionsDto } from '@/modules/admin-api/version/permission/dto/request/bulk-create-permissions.dto';
import type { CreateFeaturePermissionDto } from '@/modules/admin-api/version/permission/dto/request/create-feature-permission.dto';
import type { UpdateFeaturePermissionDto } from '@/modules/admin-api/version/permission/dto/request/update-feature-permission.dto';
import type { FeaturePermissionTableResponseDto } from '@/modules/admin-api/version/permission/dto/response/feature-permission-table-response.dto';
import { FeatureRepository } from '../../root/repositories/feature.repository';
import { FeaturePermissionRepository } from '../repositories/feature-permission.repository';

@Injectable()
export class FeaturePermissionService {
  private readonly logger = new Logger(FeaturePermissionService.name);

  private static readonly FIELD_MAP: FieldMap = {
    code: { column: featurePermissions.code, type: 'string' },
    label: { column: featurePermissions.label, type: 'string' },
    featureId: { column: featurePermissions.featureId, type: 'string' },
  };

  constructor(
    private readonly featurePermissionRepository: FeaturePermissionRepository,
    private readonly featureRepository: FeatureRepository,
    private readonly dataTableStateService: DataTableStateService,
  ) {}

  // Returns permissions visible to a business (global or linked), optionally filtered by feature, for the data table
  async findForBusinessTable(
    versionId: string,
    businessId: string,
    userId: string,
    featureId?: string,
  ): Promise<BusinessPermissionTableResponseDto> {
    const { state, activeViewId } = await this.dataTableStateService.getCurrentState(
      userId,
      `business-permissions-${businessId}`,
    );
    const where = and(
      FilterProcessor.buildWhere(state.filters, FeaturePermissionService.FIELD_MAP),
      FilterProcessor.buildSearch(state.search, FeaturePermissionService.FIELD_MAP),
    );
    const orderBy = FilterProcessor.buildOrderBy(state.sort, FeaturePermissionService.FIELD_MAP);
    const { limit = 20, offset = 0 } = state.pagination ?? {};
    const { result, count } = await this.featurePermissionRepository.findForBusinessTable(versionId, businessId, {
      featureId,
      where,
      orderBy,
      limit,
      offset,
    });
    this.logger.log(`Fetched permissions table for business: ${businessId} (${count} results)`);
    return { result: result.map(FeaturePermissionDto.from), count, state, activeViewId };
  }

  // Returns the permissions owned by a feature for the data table
  async findForFeatureTable(
    versionId: string,
    featureId: string,
    userId: string,
  ): Promise<FeaturePermissionTableResponseDto> {
    const { state, activeViewId } = await this.dataTableStateService.getCurrentState(
      userId,
      `feature-permissions-${featureId}`,
    );
    const where = and(
      FilterProcessor.buildWhere(state.filters, FeaturePermissionService.FIELD_MAP),
      FilterProcessor.buildSearch(state.search, FeaturePermissionService.FIELD_MAP),
    );
    const orderBy = FilterProcessor.buildOrderBy(state.sort, FeaturePermissionService.FIELD_MAP);
    const { limit = 20, offset = 0 } = state.pagination ?? {};
    const { result, count } = await this.featurePermissionRepository.findForFeatureTable(versionId, featureId, {
      where,
      orderBy,
      limit,
      offset,
    });
    this.logger.log(`Fetched permissions table for feature: ${featureId} (${count} results)`);
    return { result: result.map(FeaturePermissionDto.from), count, state, activeViewId };
  }

  // Creates a feature permission, linking it to businesses when not global
  async create(versionId: string, dto: CreateFeaturePermissionDto): Promise<CreateResponseDto<FeaturePermissionDto>> {
    const feature = await this.featureRepository.findById(dto.featureId);
    if (!feature || feature.versionId !== versionId) {
      throw new NotFoundException('Feature not found.');
    }
    await this.assertCodeAvailable(dto.featureId, dto.code);
    const businessIds = dto.isGlobal ? [] : (dto.businessIds ?? []);
    const created = await this.featurePermissionRepository.createWithBusinesses(
      {
        versionId,
        featureId: dto.featureId,
        code: dto.code,
        label: dto.label,
        isGlobal: dto.isGlobal,
        sortOrder: dto.sortOrder ?? 0,
      },
      businessIds,
    );
    this.logger.log(`Created permission "${created.code}" for feature: ${dto.featureId} (${created.id})`);
    return {
      success: true,
      message: `Permission "${created.label}" created successfully.`,
      data: FeaturePermissionDto.from({ ...created, featureName: feature.name, businessIds }),
    };
  }

  // Creates many permissions in one transaction (used by Quick Add); validates features + unique codes
  async bulkCreate(versionId: string, dto: BulkCreatePermissionsDto): Promise<SuccessResponseDto> {
    const featureIds = [...new Set(dto.permissions.map((p) => p.featureId))];
    for (const featureId of featureIds) {
      const feature = await this.featureRepository.findById(featureId);
      if (!feature || feature.versionId !== versionId) {
        throw new NotFoundException('Feature not found.');
      }
    }

    const seen = new Set<string>();
    for (const p of dto.permissions) {
      const key = `${p.featureId}:${p.code}`;
      if (seen.has(key)) {
        throw new ConflictException({
          label: 'Duplicate Code',
          detail: `The code "${p.code}" appears more than once in this request.`,
          errors: [{ field: 'code', message: 'Duplicate code' }],
        });
      }
      seen.add(key);
      await this.assertCodeAvailable(p.featureId, p.code);
    }

    const items = dto.permissions.map((p) => ({
      row: {
        versionId,
        featureId: p.featureId,
        code: p.code,
        label: p.label,
        isGlobal: p.isGlobal,
        sortOrder: p.sortOrder ?? 0,
      },
      businessIds: p.isGlobal ? [] : (p.businessIds ?? []),
    }));
    const count = await this.featurePermissionRepository.bulkCreate(items);
    this.logger.log(`Bulk-created ${count} permissions for version: ${versionId}`);
    return { success: true, message: `${count} permission${count === 1 ? '' : 's'} created successfully.` };
  }

  // Updates a permission row, optionally replacing its business links
  async update(permissionId: string, dto: UpdateFeaturePermissionDto): Promise<SuccessResponseDto> {
    const existing = await this.featurePermissionRepository.findById(permissionId);
    if (!existing) {
      throw new NotFoundException('Permission not found.');
    }
    if (dto.code && dto.code !== existing.code) {
      await this.assertCodeAvailable(existing.featureId, dto.code, permissionId);
    }
    const updated = await this.featurePermissionRepository.updateWithBusinesses(
      permissionId,
      existing.versionId,
      {
        ...(dto.code !== undefined ? { code: dto.code } : {}),
        ...(dto.label !== undefined ? { label: dto.label } : {}),
        ...(dto.isGlobal !== undefined ? { isGlobal: dto.isGlobal } : {}),
        ...(dto.sortOrder !== undefined ? { sortOrder: dto.sortOrder } : {}),
      },
      dto.businessIds,
    );
    this.logger.log(`Updated permission: ${permissionId}`);
    return { success: true, message: `Permission "${updated.label}" updated successfully.` };
  }

  // Deletes a permission row by ID (junction rows cascade)
  async delete(permissionId: string): Promise<SuccessResponseDto> {
    const existing = await this.featurePermissionRepository.findById(permissionId);
    if (!existing) {
      throw new NotFoundException('Permission not found.');
    }
    await this.featurePermissionRepository.deleteOne(permissionId);
    this.logger.log(`Deleted permission: ${permissionId}`);
    return { success: true, message: `Permission "${existing.label}" deleted successfully.` };
  }

  // Enforces unique permission code within a feature
  private async assertCodeAvailable(featureId: string, code: string, excludeId?: string): Promise<void> {
    const taken = await this.featurePermissionRepository.existsByCode(featureId, code, excludeId);
    if (taken) {
      throw new ConflictException({
        label: 'Code Already Exists',
        detail: 'A permission with this code already exists for this feature. Please choose a different code.',
        errors: [{ field: 'code', message: 'Duplicate code' }],
      });
    }
  }
}
