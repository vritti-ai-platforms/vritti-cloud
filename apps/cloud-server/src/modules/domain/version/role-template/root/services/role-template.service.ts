import { Injectable, Logger } from '@nestjs/common';
import {
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
import { roleTemplates } from '@/db/schema';
import { RoleTemplateDto } from '@/modules/admin-api/version/role-template/root/dto/entity/role-template.dto';
import type { CreateRoleTemplateDto } from '@/modules/admin-api/version/role-template/root/dto/request/create-role-template.dto';
import type { UpdateRoleTemplateDto } from '@/modules/admin-api/version/role-template/root/dto/request/update-role-template.dto';
import { RoleTemplateTableResponseDto } from '@/modules/admin-api/version/role-template/root/dto/response/role-template-table-response.dto';
import { RoleTemplateFeaturePermissionRepository } from '../../role-template-permission/repositories/role-template-feature-permission.repository';
import { RoleTemplatePermissionService } from '../../role-template-permission/services/role-template-permission.service';
import { RoleTemplateRepository } from '../repositories/role-template.repository';
import { RoleTemplateAppRepository } from '../repositories/role-template-app.repository';

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
    private readonly roleTemplatePermissionService: RoleTemplatePermissionService,
    private readonly dataTableStateService: DataTableStateService,
  ) {}

  // Creates a new role template and links it to selected apps
  async create(dto: CreateRoleTemplateDto): Promise<CreateResponseDto<RoleTemplateDto>> {
    const { appIds, ...roleTemplateData } = dto;
    const roleTemplate = await this.roleTemplateRepository.create(roleTemplateData);
    await this.roleTemplateAppRepository.setApps(roleTemplate.id, dto.versionId, appIds);
    this.logger.log(`Created role template: ${roleTemplate.name} (${roleTemplate.id}) with ${appIds.length} app(s)`);
    return { success: true, message: 'Role template created successfully.', data: RoleTemplateDto.from(roleTemplate, 0) };
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
      result: result.map((r) => RoleTemplateDto.from(r, r.permissionCount, r.industryName)),
      count,
      state,
      activeViewId,
    };
  }

  // Returns paginated role template options for the select component
  findForSelect(query: SelectOptionsQueryDto & { industryId?: string; versionId?: string }): Promise<SelectQueryResult> {
    this.logger.log(`Fetched role template select options (limit: ${query.limit}, offset: ${query.offset}, search: ${query.search})`);
    const where: Record<string, string> = {};
    if (query.industryId) where.industryId = query.industryId;
    if (query.versionId) where.versionId = query.versionId;
    return this.roleTemplateRepository.findForSelect({
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
      ...(Object.keys(where).length > 0 ? { where } : {}),
    });
  }

  // Finds a role template by ID with permissions grouped by app and linked app IDs
  async findById(
    id: string,
  ): Promise<RoleTemplateDto & { appIds: string[]; permissions: Awaited<ReturnType<RoleTemplatePermissionService['findByRoleTemplate']>> }> {
    const roleTemplate = await this.roleTemplateRepository.findById(id);
    if (!roleTemplate) {
      throw new NotFoundException('Role template not found.');
    }
    const [permissionCount, permissions, appIds] = await Promise.all([
      this.roleTemplateFeaturePermissionRepository.countByRoleTemplateId(id),
      this.roleTemplatePermissionService.findByRoleTemplate(id),
      this.roleTemplateAppRepository.findByRoleTemplateId(id),
    ]);
    this.logger.log(`Fetched role template: ${id}`);
    return { ...RoleTemplateDto.from(roleTemplate, permissionCount, roleTemplate.industryName), appIds, permissions };
  }

  // Updates a role template by ID and optionally replaces linked apps
  async update(id: string, dto: UpdateRoleTemplateDto): Promise<SuccessResponseDto> {
    const existing = await this.roleTemplateRepository.findById(id);
    if (!existing) {
      throw new NotFoundException('Role template not found.');
    }
    const { appIds, ...roleTemplateData } = dto;
    const roleTemplate = await this.roleTemplateRepository.update(id, roleTemplateData);
    if (appIds) {
      await this.roleTemplateAppRepository.setApps(id, existing.versionId, appIds);
    }
    this.logger.log(`Updated role template: ${roleTemplate.name} (${roleTemplate.id})`);
    return { success: true, message: 'Role template updated successfully.' };
  }

  // Deletes a role template by ID; rejects system role templates
  async delete(id: string): Promise<SuccessResponseDto> {
    const existing = await this.roleTemplateRepository.findById(id);
    if (!existing) {
      throw new NotFoundException('Role template not found.');
    }
    if (existing.isSystem) {
      throw new ConflictException({
        label: 'System Role Template',
        detail: `Cannot delete "${existing.name}" because it is a system-defined role template.`,
      });
    }
    await this.roleTemplateRepository.delete(id);
    this.logger.log(`Deleted role template: ${existing.name} (${existing.id})`);
    return { success: true, message: 'Role template deleted successfully.' };
  }
}
