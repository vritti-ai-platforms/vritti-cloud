import { Injectable, Logger } from '@nestjs/common';
import {
  ConflictException,
  DataTableStateService,
  type FieldMap,
  FilterProcessor,
  NotFoundException,
  SuccessResponseDto,
} from '@vritti/api-sdk';
import { and } from '@vritti/api-sdk/drizzle-orm';
import { planApps } from '@/db/schema';
import { PlanRepository } from '../repositories/plan.repository';
import { PlanAppDto } from '@/modules/admin-api/plan/plan-app/dto/entity/plan-app.dto';
import { PlanAppTableRowDto } from '@/modules/admin-api/plan/plan-app/dto/entity/plan-app-table-row.dto';
import type { PlanAppTableResponseDto } from '@/modules/admin-api/plan/plan-app/dto/response/plan-app-table-response.dto';
import type { AssignPlanAppDto } from '@/modules/admin-api/plan/plan-app/dto/request/assign-plan-app.dto';
import type { UpdatePlanAppDto } from '@/modules/admin-api/plan/plan-app/dto/request/update-plan-app.dto';
import { PlanAppRepository } from '../repositories/plan-app.repository';

@Injectable()
export class PlanAppService {
  private readonly logger = new Logger(PlanAppService.name);

  private static readonly FIELD_MAP: FieldMap = {
    appCode: { column: planApps.appCode, type: 'string' },
  };

  constructor(
    private readonly planAppRepository: PlanAppRepository,
    private readonly planRepository: PlanRepository,
    private readonly dataTableStateService: DataTableStateService,
  ) {}

  // Returns plan apps for the data table with server-stored filter/sort/search/pagination state
  async findForTable(userId: string, planId: string): Promise<PlanAppTableResponseDto> {
    await this.ensurePlanExists(planId);
    const { state, activeViewId } = await this.dataTableStateService.getCurrentState(userId, `plan-apps-${planId}`);
    const filterWhere = FilterProcessor.buildWhere(state.filters, PlanAppService.FIELD_MAP);
    const searchWhere = FilterProcessor.buildSearch(state.search, PlanAppService.FIELD_MAP);
    const where = and(filterWhere, searchWhere);
    const orderBy = FilterProcessor.buildOrderBy(state.sort, PlanAppService.FIELD_MAP);
    const { limit = 20, offset = 0 } = state.pagination ?? {};
    const { rows, total } = await this.planAppRepository.findAllForTable(planId, where, orderBy, limit, offset);
    this.logger.log(`Fetched plan apps table for plan: ${planId} (${total} results, limit: ${limit}, offset: ${offset})`);
    return { result: rows.map(PlanAppTableRowDto.from), count: total, state, activeViewId };
  }

  // Lists all apps assigned to a plan
  async findByPlan(planId: string): Promise<PlanAppDto[]> {
    await this.ensurePlanExists(planId);
    const rows = await this.planAppRepository.findByPlanId(planId);
    this.logger.log(`Fetched ${rows.length} apps for plan: ${planId}`);
    return rows.map((row) => {
      const planApp = { id: row.id, planId: row.planId, appCode: row.appCode, includedFeatureCodes: row.includedFeatureCodes, sortOrder: row.sortOrder, createdAt: new Date() };
      return PlanAppDto.from(planApp);
    });
  }

  // Assigns an app to a plan by code; validates plan exists and no duplicate
  async assign(planId: string, dto: AssignPlanAppDto): Promise<PlanAppDto> {
    await this.ensurePlanExists(planId);
    const existing = await this.planAppRepository.findByPlanAndAppCode(planId, dto.appCode);
    if (existing) {
      throw new ConflictException({
        label: 'App Already Assigned',
        detail: 'This app is already assigned to the plan. Remove it first or update the existing assignment.',
        errors: [{ field: 'appCode', message: 'Already assigned' }],
      });
    }
    const planApp = await this.planAppRepository.create({
      planId,
      appCode: dto.appCode,
      includedFeatureCodes: dto.includedFeatureCodes ?? null,
      sortOrder: dto.sortOrder ?? 0,
    });
    this.logger.log(`Assigned app ${dto.appCode} to plan ${planId}`);
    return PlanAppDto.from(planApp);
  }

  // Updates included feature codes for a plan-app assignment
  async updateFeatureCodes(planId: string, appCode: string, dto: UpdatePlanAppDto): Promise<SuccessResponseDto> {
    await this.ensurePlanExists(planId);
    const planApp = await this.planAppRepository.findByPlanAndAppCode(planId, appCode);
    if (!planApp) {
      throw new NotFoundException('App is not assigned to this plan.');
    }
    const updateData: { includedFeatureCodes?: string[] | null; sortOrder?: number } = {};
    if (dto.includedFeatureCodes !== undefined) {
      updateData.includedFeatureCodes = dto.includedFeatureCodes;
    }
    if (dto.sortOrder !== undefined) {
      updateData.sortOrder = dto.sortOrder;
    }
    await this.planAppRepository.updateIncludedFeatureCodes(planApp.id, updateData);
    this.logger.log(`Updated plan-app assignment for plan ${planId}, app ${appCode}`);
    return { success: true, message: 'Plan app updated successfully.' };
  }

  // Removes an app from a plan
  async remove(planId: string, appCode: string): Promise<SuccessResponseDto> {
    await this.ensurePlanExists(planId);
    const planApp = await this.planAppRepository.findByPlanAndAppCode(planId, appCode);
    if (!planApp) {
      throw new NotFoundException('App is not assigned to this plan.');
    }
    await this.planAppRepository.removeByPlanAndAppCode(planId, appCode);
    this.logger.log(`Removed app ${appCode} from plan ${planId}`);
    return { success: true, message: 'App removed from plan successfully.' };
  }

  // Validates that a plan exists; throws NotFoundException otherwise
  private async ensurePlanExists(planId: string): Promise<void> {
    const plan = await this.planRepository.findById(planId);
    if (!plan) {
      throw new NotFoundException('Plan not found.');
    }
  }
}
