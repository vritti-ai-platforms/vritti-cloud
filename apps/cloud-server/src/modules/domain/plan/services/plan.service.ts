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
import { type Column, and, sql } from '@vritti/api-sdk/drizzle-orm';
import { plans, prices } from '@/db/schema';
import { PriceService } from '@/modules/domain/price/services/price.service';
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
    priceCount: {
      column: sql<number>`count(${prices.id})` as unknown as Column,
      type: 'number',
    },
  };

  constructor(
    private readonly planRepository: PlanRepository,
    private readonly priceService: PriceService,
    private readonly dataTableStateService: DataTableStateService,
  ) {}

  // Returns paginated plan options for the select component
  findForSelect(query: SelectOptionsQueryDto): Promise<SelectQueryResult> {
    this.logger.log(`Fetched plan select options (limit: ${query.limit}, offset: ${query.offset}, search: ${query.search})`);
    return this.planRepository.findForSelect({
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
    });
  }

  // Creates a new plan; throws ConflictException on duplicate code
  async create(dto: CreatePlanDto): Promise<PlanDto> {
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
    return PlanDto.from(plan);
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
    const result = rows.map((plan) => PlanDto.from(plan, { priceCount: plan.priceCount }));
    this.logger.log(`Fetched plans table (${total} results, limit: ${limit}, offset: ${offset})`);
    return { result, count: total, state, activeViewId };
  }

  // Finds a plan by ID with canDelete flag; throws NotFoundException if not found
  async findById(id: string): Promise<PlanDto> {
    const plan = await this.planRepository.findById(id);
    if (!plan) {
      throw new NotFoundException('Plan not found.');
    }
    const [priceCounts, refCounts] = await Promise.all([
      this.priceService.getCountsForPlan(id),
      this.planRepository.getReferenceCountsWithoutPrices(id),
    ]);
    const { priceCount, regionCount, providerCount } = priceCounts;
    const { deploymentCount, orgCount } = refCounts;
    const canDelete = priceCount === 0 && deploymentCount === 0 && orgCount === 0;
    this.logger.log(`Fetched plan: ${id}`);
    return PlanDto.from(plan, { priceCount, regionCount, providerCount, orgCount }, canDelete);
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
    return { success: true, message: 'Plan updated successfully.' };
  }

  // Deletes a plan by ID; throws NotFoundException if not found, ConflictException if referenced
  async delete(id: string): Promise<SuccessResponseDto> {
    const existing = await this.planRepository.findById(id);
    if (!existing) {
      throw new NotFoundException('Plan not found.');
    }
    const [priceCounts, refCounts] = await Promise.all([
      this.priceService.getCountsForPlan(id),
      this.planRepository.getReferenceCountsWithoutPrices(id),
    ]);
    if (priceCounts.priceCount > 0 || refCounts.deploymentCount > 0 || refCounts.orgCount > 0) {
      throw new ConflictException({
        label: 'Plan In Use',
        detail: `Cannot delete "${existing.name}" — it has prices or deployment assignments. Remove those first.`,
      });
    }
    await this.planRepository.delete(id);
    this.logger.log(`Deleted plan: ${existing.name} (${existing.id})`);
    return { success: true, message: 'Plan deleted successfully.' };
  }
}
