import { Injectable, Logger } from '@nestjs/common';
import {
  CreateResponseDto,
  DataTableStateService,
  type FieldMap,
  type FilterCondition,
  FilterProcessor,
  NotFoundException,
  SelectOptionsQueryDto,
  type SelectQueryResult,
  SuccessResponseDto,
} from '@vritti/api-sdk';
import { and } from '@vritti/api-sdk/drizzle-orm';
import { roleTemplates } from '@/db/schema';
import { RoleTemplateDto } from '@/modules/admin-api/version/business/role-template/root/dto/entity/role-template.dto';
import { RoleTemplateTableRowDto } from '@/modules/admin-api/version/business/role-template/root/dto/entity/role-template-table-row.dto';
import type { CreateRoleTemplateDto } from '@/modules/admin-api/version/business/role-template/root/dto/request/create-role-template.dto';
import type { UpdateRoleTemplateDto } from '@/modules/admin-api/version/business/role-template/root/dto/request/update-role-template.dto';
import { RoleTemplateTableResponseDto } from '@/modules/admin-api/version/business/role-template/root/dto/response/role-template-table-response.dto';
import { RoleTemplateFeaturePermissionRepository } from '../../role-template-permission/repositories/role-template-feature-permission.repository';
import { RoleTemplateRepository } from '../repositories/role-template.repository';

@Injectable()
export class RoleTemplateService {
  private readonly logger = new Logger(RoleTemplateService.name);

  private static readonly FIELD_MAP: FieldMap = {
    name: { column: roleTemplates.name, type: 'string' },
    scope: { column: roleTemplates.scope, type: 'string' },
    businessId: { column: roleTemplates.businessId, type: 'string' },
  };

  constructor(
    private readonly roleTemplateRepository: RoleTemplateRepository,
    private readonly roleTemplateFeaturePermissionRepository: RoleTemplateFeaturePermissionRepository,
    private readonly dataTableStateService: DataTableStateService,
  ) {}

  // Creates a new role template (its apps are derived from the permissions it later grants)
  async create(businessId: string, dto: CreateRoleTemplateDto): Promise<CreateResponseDto<RoleTemplateDto>> {
    const roleTemplate = await this.roleTemplateRepository.create({ ...dto, businessId });
    this.logger.log(`Created role template: ${roleTemplate.name} (${roleTemplate.id})`);
    return {
      success: true,
      message: `Role template "${roleTemplate.name}" created successfully.`,
      data: RoleTemplateDto.from(roleTemplate),
    };
  }

  // Returns role templates for the data table with server-stored filter/sort/search/pagination state
  async findForTable(userId: string, businessId?: string): Promise<RoleTemplateTableResponseDto> {
    const { state, activeViewId } = await this.dataTableStateService.getCurrentState(userId, 'role-templates');
    const filters: FilterCondition[] = [...state.filters];
    if (businessId) {
      filters.push({ field: 'businessId', operator: 'equals', value: businessId });
    }
    const filterWhere = FilterProcessor.buildWhere(filters, RoleTemplateService.FIELD_MAP);
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
    query: SelectOptionsQueryDto & { businessId?: string; versionId?: string },
  ): Promise<SelectQueryResult> {
    this.logger.log(
      `Fetched role template select options (limit: ${query.limit}, offset: ${query.offset}, search: ${query.search})`,
    );
    const where: Record<string, string> = {};
    if (query.businessId) where.businessId = query.businessId;
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

  // Finds a role template by ID within a business with business name and permission count
  async findById(
    businessId: string,
    id: string,
  ): Promise<RoleTemplateDto & { businessName: string; permissionCount: number }> {
    const roleTemplate = await this.roleTemplateRepository.findById(id);
    if (!roleTemplate || roleTemplate.businessId !== businessId) {
      throw new NotFoundException('Role template not found.');
    }
    const permissionCount = await this.roleTemplateFeaturePermissionRepository.countByRoleTemplateId(id);
    this.logger.log(`Fetched role template: ${id}`);
    return {
      ...RoleTemplateDto.from(roleTemplate),
      businessName: roleTemplate.businessName,
      permissionCount,
    };
  }

  // Updates a role template by ID within a business
  async update(businessId: string, id: string, dto: UpdateRoleTemplateDto): Promise<SuccessResponseDto> {
    const existing = await this.roleTemplateRepository.findById(id);
    if (!existing || existing.businessId !== businessId) {
      throw new NotFoundException('Role template not found.');
    }
    const roleTemplate = await this.roleTemplateRepository.update(id, dto);
    this.logger.log(`Updated role template: ${roleTemplate.name} (${roleTemplate.id})`);
    return { success: true, message: `Role template "${roleTemplate.name}" updated successfully.` };
  }

  // Deletes a role template by ID within a business
  async delete(businessId: string, id: string): Promise<SuccessResponseDto> {
    const existing = await this.roleTemplateRepository.findById(id);
    if (!existing || existing.businessId !== businessId) {
      throw new NotFoundException('Role template not found.');
    }
    await this.roleTemplateRepository.delete(id);
    this.logger.log(`Deleted role template: ${existing.name} (${existing.id})`);
    return { success: true, message: `Role template "${existing.name}" deleted successfully.` };
  }
}
