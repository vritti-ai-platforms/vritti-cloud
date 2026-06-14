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
import { and, type Column, sql } from '@vritti/api-sdk/drizzle-orm';
import { planPrices, plans } from '@/db/schema';
import { PlanDto } from '@/modules/admin-api/plan/root/dto/entity/plan.dto';
import type { CreatePlanDto } from '@/modules/admin-api/plan/root/dto/request/create-plan.dto';
import type { UpdatePlanDto } from '@/modules/admin-api/plan/root/dto/request/update-plan.dto';
import { PlansTableResponseDto } from '@/modules/admin-api/plan/root/dto/response/plans-table-response.dto';
import { PlanRepository } from '../repositories/plan.repository';

@Injectable()
export class PlanService {
  private readonly logger = new Logger(PlanService.name);

  private static readonly FIELD_MAP: FieldMap = {
    name: { column: plans.name, type: 'string' },
    code: { column: plans.code, type: 'string' },
    businessId: { column: plans.businessId, type: 'string' },
    priceCount: {
      column: sql<number>`count(${planPrices.id})` as unknown as Column,
      type: 'number',
    },
  };

  constructor(
    private readonly planRepository: PlanRepository,
    private readonly dataTableStateService: DataTableStateService,
  ) {}

  // Returns paginated plan options for the select component
  findForSelect(query: SelectOptionsQueryDto & { businessId?: string }): Promise<SelectQueryResult> {
    this.logger.log(
      `Fetched plan select options (limit: ${query.limit}, offset: ${query.offset}, search: ${query.search})`,
    );
    return this.planRepository.findForSelect({
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
      ...(query.businessId ? { where: { businessId: query.businessId } } : {}),
    });
  }

  // Creates a new plan; throws ConflictException on duplicate code
  async create(dto: CreatePlanDto): Promise<CreateResponseDto<PlanDto>> {
    const existing = await this.planRepository.findByCode(dto.code);
    if (existing) {
      throw new ConflictException({
        label: 'Code Already Exists',
        detail: 'A plan with this code already exists. Please choose a different code.',
        errors: [{ field: 'code', message: 'Duplicate code' }],
      });
    }
    const plan = await this.planRepository.create(dto);
    this.logger.log(`Created plan: ${plan.name} (${plan.id})`);
    return { success: true, message: `Plan "${plan.name}" created successfully.`, data: PlanDto.from(plan) };
  }

  // Returns plans for the data table with server-stored filter/sort/search/pagination state
  async findForTable(userId: string): Promise<PlansTableResponseDto> {
    const { state, activeViewId } = await this.dataTableStateService.getCurrentState(userId, 'plans');
    const where = and(
      FilterProcessor.buildWhere(state.filters, PlanService.FIELD_MAP),
      FilterProcessor.buildSearch(state.search, PlanService.FIELD_MAP),
    );
    const { limit = 20, offset = 0 } = state.pagination ?? {};
    const { rows, total } = await this.planRepository.findAllWithCounts({
      where,
      orderBy: FilterProcessor.buildOrderBy(state.sort, PlanService.FIELD_MAP),
      limit,
      offset,
    });
    const result = rows.map((plan) =>
      PlanDto.from(plan, {
        priceCount: plan.priceCount,
        marketCount: plan.marketCount,
        businessName: plan.businessName,
      }),
    );
    this.logger.log(`Fetched plans table (${total} results, limit: ${limit}, offset: ${offset})`);
    return { result, count: total, state, activeViewId };
  }

  // Finds a plan by ID with canDelete flag; throws NotFoundException if not found
  async findById(id: string): Promise<PlanDto> {
    const plan = await this.planRepository.findById(id);
    if (!plan) {
      throw new NotFoundException('Plan not found.');
    }
    const { priceCount, deploymentCount, orgCount, businessName, marketCount } =
      await this.planRepository.getReferenceCounts(id);
    const canDelete = priceCount === 0 && deploymentCount === 0 && orgCount === 0;
    this.logger.log(`Fetched plan: ${id}`);
    return PlanDto.from(plan, { priceCount, orgCount, marketCount, businessName }, canDelete);
  }

  // Updates a plan by ID; throws NotFoundException if not found, ConflictException on duplicate code
  async update(id: string, dto: UpdatePlanDto): Promise<SuccessResponseDto> {
    const existing = await this.planRepository.findById(id);
    if (!existing) {
      throw new NotFoundException('Plan not found.');
    }
    if (dto.code) {
      const existingCode = await this.planRepository.findByCode(dto.code);
      if (existingCode && existingCode.id !== id) {
        throw new ConflictException({
          label: 'Code Already Exists',
          detail: 'A plan with this code already exists. Please choose a different code.',
          errors: [{ field: 'code', message: 'Duplicate code' }],
        });
      }
    }
    const plan = await this.planRepository.update(id, dto);
    this.logger.log(`Updated plan: ${plan.name} (${plan.id})`);
    return { success: true, message: `Plan "${plan.name}" updated successfully.` };
  }

  // Deletes a plan by ID; throws NotFoundException if not found, ConflictException if referenced
  async delete(id: string): Promise<SuccessResponseDto> {
    const existing = await this.planRepository.findById(id);
    if (!existing) {
      throw new NotFoundException('Plan not found.');
    }
    const { priceCount, deploymentCount, orgCount } = await this.planRepository.getReferenceCounts(id);
    if (priceCount > 0 || deploymentCount > 0 || orgCount > 0) {
      throw new ConflictException({
        label: 'Plan In Use',
        detail: `Cannot delete "${existing.name}" — it has prices or deployment assignments. Remove those first.`,
      });
    }
    await this.planRepository.delete(id);
    this.logger.log(`Deleted plan: ${existing.name} (${existing.id})`);
    return { success: true, message: `Plan "${existing.name}" deleted successfully.` };
  }
}
