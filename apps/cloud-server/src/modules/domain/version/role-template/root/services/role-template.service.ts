import { Injectable, Logger } from '@nestjs/common';
import {
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
import { roleTemplates } from '@/db/schema';
import { RoleTemplateDto } from '@/modules/admin-api/version/role-template/root/dto/entity/role-template.dto';
import { RoleTemplateTableRowDto } from '@/modules/admin-api/version/role-template/root/dto/entity/role-template-table-row.dto';
import type { CreateRoleTemplateDto } from '@/modules/admin-api/version/role-template/root/dto/request/create-role-template.dto';
import type { UpdateRoleTemplateDto } from '@/modules/admin-api/version/role-template/root/dto/request/update-role-template.dto';
import { RoleTemplateTableResponseDto } from '@/modules/admin-api/version/role-template/root/dto/response/role-template-table-response.dto';
import { RoleTemplateAppRepository } from '../../role-template-app/repositories/role-template-app.repository';
import { RoleTemplateFeaturePermissionRepository } from '../../role-template-permission/repositories/role-template-feature-permission.repository';
import { RoleTemplateRepository } from '../repositories/role-template.repository';

@Injectable()
export class RoleTemplateService {
  private readonly logger = new Logger(RoleTemplateService.name);

  private static readonly FIELD_MAP: FieldMap = {
    name: { column: roleTemplates.name, type: 'string' },
    scope: { column: roleTemplates.scope, type: 'string' },
  };

  constructor(
    private readonly roleTemplateRepository: RoleTemplateRepository,
    private readonly roleTemplateAppRepository: RoleTemplateAppRepository,
    private readonly roleTemplateFeaturePermissionRepository: RoleTemplateFeaturePermissionRepository,
    private readonly dataTableStateService: DataTableStateService,
  ) {}

  // Creates a new role template and links it to selected apps
  async create(dto: CreateRoleTemplateDto): Promise<CreateResponseDto<RoleTemplateDto>> {
    const { appIds, ...roleTemplateData } = dto;
    const roleTemplate = await this.roleTemplateRepository.transaction(async (tx) => {
      const created = await this.roleTemplateRepository.create(roleTemplateData, tx);
      await this.roleTemplateAppRepository.setApps(created.id, dto.versionId, appIds, tx);
      return created;
    });
    this.logger.log(`Created role template: ${roleTemplate.name} (${roleTemplate.id}) with ${appIds.length} app(s)`);
    return {
      success: true,
      message: `Role template "${roleTemplate.name}" created successfully.`,
      data: RoleTemplateDto.from(roleTemplate),
    };
  }

  // Returns role templates for the data table with server-stored filter/sort/search/pagination state
  async findForTable(userId: string): Promise<RoleTemplateTableResponseDto> {
    const { state, activeViewId } = await this.dataTableStateService.getCurrentState(userId, 'role-templates');
    const filterWhere = FilterProcessor.buildWhere(state.filters, RoleTemplateService.FIELD_MAP);
    const searchWhere = FilterProcessor.buildSearch(state.search, RoleTemplateService.FIELD_MAP);
    const where = and(filterWhere, searchWhere);
    const orderBy = FilterProcessor.buildOrderBy(state.sort, RoleTemplateService.FIELD_MAP);
    const { limit = 20, offset = 0 } = state.pagination ?? {};
    const { result, count } = await this.roleTemplateRepository.findAllWithCounts({ where, orderBy, limit, offset });
    this.logger.log(`Fetched role templates table (${count} results, limit: ${limit}, offset: ${offset})`);
    return {
      result: result.map((r) => RoleTemplateTableRowDto.fromRow(r)),
      count,
      state,
      activeViewId,
    };
  }

  // Returns paginated role template options for the select component
  findForSelect(
    query: SelectOptionsQueryDto & { industryId?: string; versionId?: string },
  ): Promise<SelectQueryResult> {
    this.logger.log(
      `Fetched role template select options (limit: ${query.limit}, offset: ${query.offset}, search: ${query.search})`,
    );
    const where: Record<string, string> = {};
    if (query.industryId) where.industryId = query.industryId;
    if (query.versionId) where.versionId = query.versionId;
    return this.roleTemplateRepository.findForSelect({
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
      ...(Object.keys(where).length > 0 ? { where } : {}),
    });
  }

  // Finds a role template by ID with industry name, permission count, and app count
  async findById(
    id: string,
  ): Promise<RoleTemplateDto & { industryName: string; permissionCount: number; appCount: number }> {
    const roleTemplate = await this.roleTemplateRepository.findById(id);
    if (!roleTemplate) {
      throw new NotFoundException('Role template not found.');
    }
    const [permissionCount, appIds] = await Promise.all([
      this.roleTemplateFeaturePermissionRepository.countByRoleTemplateId(id),
      this.roleTemplateAppRepository.findByRoleTemplateId(id),
    ]);
    this.logger.log(`Fetched role template: ${id}`);
    return {
      ...RoleTemplateDto.from(roleTemplate),
      industryName: roleTemplate.industryName,
      permissionCount,
      appCount: appIds.length,
    };
  }

  // Updates a role template by ID and optionally replaces linked apps
  async update(id: string, dto: UpdateRoleTemplateDto): Promise<SuccessResponseDto> {
    const existing = await this.roleTemplateRepository.findById(id);
    if (!existing) {
      throw new NotFoundException('Role template not found.');
    }
    const { appIds, ...roleTemplateData } = dto;
    const roleTemplate = await this.roleTemplateRepository.transaction(async (tx) => {
      const updated = await this.roleTemplateRepository.update(id, roleTemplateData, tx);
      if (appIds) {
        await this.roleTemplateAppRepository.setApps(id, existing.versionId, appIds, tx);
      }
      return updated;
    });
    this.logger.log(`Updated role template: ${roleTemplate.name} (${roleTemplate.id})`);
    return { success: true, message: `Role template "${roleTemplate.name}" updated successfully.` };
  }

  // Deletes a role template by ID
  async delete(id: string): Promise<SuccessResponseDto> {
    const existing = await this.roleTemplateRepository.findById(id);
    if (!existing) {
      throw new NotFoundException('Role template not found.');
    }
    await this.roleTemplateRepository.delete(id);
    this.logger.log(`Deleted role template: ${existing.name} (${existing.id})`);
    return { success: true, message: `Role template "${existing.name}" deleted successfully.` };
  }
}
