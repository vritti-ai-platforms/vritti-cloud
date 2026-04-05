import { AppRepository } from '@domain/version/app/root/repositories/app.repository';
import { Injectable, Logger } from '@nestjs/common';
import {
  ConflictException,
  DataTableStateService,
  type FieldMap,
  FilterProcessor,
  NotFoundException,
  SuccessResponseDto,
} from '@vritti/api-sdk';
import { and, eq } from '@vritti/api-sdk/drizzle-orm';
import { apps } from '@/db/schema';
import { RoleTemplateAppTableRowDto } from '@/modules/admin-api/version/role-template/role-template-app/dto/entity/role-template-app-table-row.dto';
import type { RoleTemplateAppTableResponseDto } from '@/modules/admin-api/version/role-template/role-template-app/dto/response/role-template-app-table-response.dto';
import { RoleTemplateFeaturePermissionRepository } from '../../role-template-permission/repositories/role-template-feature-permission.repository';
import { RoleTemplateRepository } from '../../root/repositories/role-template.repository';
import { RoleTemplateAppRepository } from '../repositories/role-template-app.repository';

@Injectable()
export class RoleTemplateAppService {
  private readonly logger = new Logger(RoleTemplateAppService.name);

  private static readonly FIELD_MAP: FieldMap = {
    code: { column: apps.code, type: 'string' },
    name: { column: apps.name, type: 'string' },
  };

  constructor(
    private readonly roleTemplateRepository: RoleTemplateRepository,
    private readonly roleTemplateAppRepository: RoleTemplateAppRepository,
    private readonly roleTemplateFeaturePermissionRepository: RoleTemplateFeaturePermissionRepository,
    private readonly appRepository: AppRepository,
    private readonly dataTableStateService: DataTableStateService,
  ) {}

  // Returns apps for the data table with assignment status and server-stored state
  async findForTable(
    userId: string,
    roleTemplateId: string,
    versionId: string,
  ): Promise<RoleTemplateAppTableResponseDto> {
    const { state, activeViewId } = await this.dataTableStateService.getCurrentState(
      userId,
      `role-template-apps-${roleTemplateId}`,
    );
    const filterWhere = FilterProcessor.buildWhere(state.filters, RoleTemplateAppService.FIELD_MAP);
    const searchWhere = FilterProcessor.buildSearch(state.search, RoleTemplateAppService.FIELD_MAP);
    const where = and(eq(apps.versionId, versionId), filterWhere, searchWhere);
    const orderBy = FilterProcessor.buildOrderBy(state.sort, RoleTemplateAppService.FIELD_MAP);
    const { limit = 20, offset = 0 } = state.pagination ?? {};
    const { result, count } = await this.roleTemplateAppRepository.findAllWithAssignment(roleTemplateId, {
      where,
      orderBy,
      limit,
      offset,
    });
    this.logger.log(
      `Fetched role template apps table for ${roleTemplateId} (${count} results, limit: ${limit}, offset: ${offset})`,
    );
    return { result: result.map(RoleTemplateAppTableRowDto.from), count, state, activeViewId };
  }

  // Returns apps linked to a role template with details
  async findByRoleTemplate(
    roleTemplateId: string,
  ): Promise<Array<{ id: string; code: string; name: string; icon: string }>> {
    const roleTemplate = await this.roleTemplateRepository.findById(roleTemplateId);
    if (!roleTemplate) {
      throw new NotFoundException('Role template not found.');
    }
    return this.roleTemplateAppRepository.findByRoleTemplateIdWithDetails(roleTemplateId);
  }

  // Adds a single app to a role template
  async addApp(roleTemplateId: string, appId: string, versionId: string): Promise<SuccessResponseDto> {
    const [roleTemplate, app] = await Promise.all([
      this.roleTemplateRepository.findById(roleTemplateId),
      this.appRepository.findById(appId),
    ]);
    if (!roleTemplate) throw new NotFoundException('Role template not found.');
    if (!app) throw new NotFoundException('App not found.');
    await this.roleTemplateAppRepository.addApp(roleTemplateId, appId, versionId);
    this.logger.log(`Added app ${app.name} to role template: ${roleTemplate.name} (${roleTemplateId})`);
    return { success: true, message: `App "${app.name}" added successfully.` };
  }

  // Removes an app from a role template; rejects if permissions reference features from this app
  async removeApp(roleTemplateId: string, appId: string): Promise<SuccessResponseDto> {
    const roleTemplate = await this.roleTemplateRepository.findById(roleTemplateId);
    if (!roleTemplate) throw new NotFoundException('Role template not found.');
    const permCount = await this.roleTemplateFeaturePermissionRepository.countByAppForRoleTemplate(
      roleTemplateId,
      appId,
    );
    if (permCount > 0) {
      throw new ConflictException({
        label: 'App Has Permissions',
        detail: `Cannot remove this app — it has ${permCount} permission${permCount > 1 ? 's' : ''} assigned. Remove those permissions first.`,
      });
    }
    await this.roleTemplateAppRepository.removeByRoleTemplateAndApp(roleTemplateId, appId);
    this.logger.log(`Removed app ${appId} from role template: ${roleTemplate.name} (${roleTemplateId})`);
    return { success: true, message: `App removed from role template "${roleTemplate.name}" successfully.` };
  }
}
