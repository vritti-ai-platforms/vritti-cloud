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
import { roles } from '@/db/schema';
import { RolePermissionService } from '../../role-permission/services/role-permission.service';
import { RoleFeaturePermissionRepository } from '../../role-permission/repositories/role-feature-permission.repository';
import { RoleDto } from '@/modules/admin-api/app-version/role/root/dto/entity/role.dto';
import type { CreateRoleDto } from '@/modules/admin-api/app-version/role/root/dto/request/create-role.dto';
import type { UpdateRoleDto } from '@/modules/admin-api/app-version/role/root/dto/request/update-role.dto';
import { RoleTableResponseDto } from '@/modules/admin-api/app-version/role/root/dto/response/role-table-response.dto';
import { RoleAppRepository } from '../repositories/role-app.repository';
import { RoleRepository } from '../repositories/role.repository';

@Injectable()
export class RoleService {
  private readonly logger = new Logger(RoleService.name);

  private static readonly FIELD_MAP: FieldMap = {
    name: { column: roles.name, type: 'string' },
    scope: { column: roles.scope, type: 'string' },
  };

  constructor(
    private readonly roleRepository: RoleRepository,
    private readonly roleAppRepository: RoleAppRepository,
    private readonly roleFeaturePermissionRepository: RoleFeaturePermissionRepository,
    private readonly rolePermissionService: RolePermissionService,
    private readonly dataTableStateService: DataTableStateService,
  ) {}

  // Creates a new role template and links it to selected apps
  async create(dto: CreateRoleDto): Promise<RoleDto> {
    const { appIds, ...roleData } = dto;
    const role = await this.roleRepository.create(roleData);
    await this.roleAppRepository.setApps(role.id, dto.appVersionId, appIds);
    this.logger.log(`Created role: ${role.name} (${role.id}) with ${appIds.length} app(s)`);
    return RoleDto.from(role, 0);
  }

  // Returns roles for the data table with server-stored filter/sort/search/pagination state
  async findForTable(userId: string): Promise<RoleTableResponseDto> {
    const { state, activeViewId } = await this.dataTableStateService.getCurrentState(userId, 'roles');
    const filterWhere = FilterProcessor.buildWhere(state.filters, RoleService.FIELD_MAP);
    const searchWhere = FilterProcessor.buildSearch(state.search, RoleService.FIELD_MAP);
    const where = and(filterWhere, searchWhere);
    const orderBy = FilterProcessor.buildOrderBy(state.sort, RoleService.FIELD_MAP);
    const { limit = 20, offset = 0 } = state.pagination ?? {};
    const { result, count } = await this.roleRepository.findAllWithCounts({ where, orderBy, limit, offset });
    this.logger.log(`Fetched roles table (${count} results, limit: ${limit}, offset: ${offset})`);
    return {
      result: result.map((r) => RoleDto.from(r, r.permissionCount, r.industryName)),
      count,
      state,
      activeViewId,
    };
  }

  // Returns paginated role options for the select component, optionally filtered by industryId
  findForSelect(query: SelectOptionsQueryDto, industryId?: string): Promise<SelectQueryResult> {
    this.logger.log(`Fetched role select options (limit: ${query.limit}, offset: ${query.offset}, search: ${query.search})`);
    return this.roleRepository.findForSelect({
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
      ...(industryId ? { where: { industryId } } : {}),
    });
  }

  // Finds a role by ID with permissions grouped by app and linked app IDs
  async findById(id: string): Promise<RoleDto & { appIds: string[]; permissions: Awaited<ReturnType<RolePermissionService['findByRole']>> }> {
    const role = await this.roleRepository.findById(id);
    if (!role) {
      throw new NotFoundException('Role not found.');
    }
    const [permissionCount, permissions, appIds] = await Promise.all([
      this.roleFeaturePermissionRepository.countByRoleId(id),
      this.rolePermissionService.findByRole(id),
      this.roleAppRepository.findByRoleId(id),
    ]);
    this.logger.log(`Fetched role: ${id}`);
    return { ...RoleDto.from(role, permissionCount, role.industryName), appIds, permissions };
  }

  // Updates a role by ID and optionally replaces linked apps
  async update(id: string, dto: UpdateRoleDto): Promise<SuccessResponseDto> {
    const existing = await this.roleRepository.findById(id);
    if (!existing) {
      throw new NotFoundException('Role not found.');
    }
    const { appIds, ...roleData } = dto;
    const role = await this.roleRepository.update(id, roleData);
    if (appIds) {
      await this.roleAppRepository.setApps(id, existing.appVersionId, appIds);
    }
    this.logger.log(`Updated role: ${role.name} (${role.id})`);
    return { success: true, message: 'Role updated successfully.' };
  }

  // Deletes a role by ID; rejects system roles
  async delete(id: string): Promise<SuccessResponseDto> {
    const existing = await this.roleRepository.findById(id);
    if (!existing) {
      throw new NotFoundException('Role not found.');
    }
    if (existing.isSystem) {
      throw new ConflictException({
        label: 'System Role',
        detail: `Cannot delete "${existing.name}" because it is a system-defined role.`,
      });
    }
    await this.roleRepository.delete(id);
    this.logger.log(`Deleted role: ${existing.name} (${existing.id})`);
    return { success: true, message: 'Role deleted successfully.' };
  }
}
