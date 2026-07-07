import { Injectable, Logger } from '@nestjs/common';
import {
  ConflictException,
  CreateResponseDto,
  DataTableStateService,
  type FieldMap,
  FilterProcessor,
  NotFoundException,
  type SelectOptionsQueryDto,
  type SelectQueryResult,
  SuccessResponseDto,
} from '@vritti/api-sdk';
import { and } from '@vritti/api-sdk/drizzle-orm';
import { billingCycles } from '@/db/schema';
import { BillingCycleDto } from '@/modules/admin-api/billing-cycle/dto/entity/billing-cycle.dto';
import type { CreateBillingCycleDto } from '@/modules/admin-api/billing-cycle/dto/request/create-billing-cycle.dto';
import type { UpdateBillingCycleDto } from '@/modules/admin-api/billing-cycle/dto/request/update-billing-cycle.dto';
import { BillingCycleTableResponseDto } from '@/modules/admin-api/billing-cycle/dto/response/billing-cycles-response.dto';
import { PlanPriceRepository } from '@/modules/domain/plan-price/repositories/plan-price.repository';
import { BillingCycleRepository } from '../repositories/billing-cycle.repository';

@Injectable()
export class BillingCycleService {
  private readonly logger = new Logger(BillingCycleService.name);

  private static readonly FIELD_MAP: FieldMap = {
    name: { column: billingCycles.name, type: 'string' },
    days: { column: billingCycles.days, type: 'number' },
    isActive: { column: billingCycles.isActive, type: 'boolean' },
  };

  constructor(
    private readonly billingCycleRepository: BillingCycleRepository,
    private readonly dataTableStateService: DataTableStateService,
    private readonly planPriceRepository: PlanPriceRepository,
  ) {}

  // Returns paginated billing cycle options for the select component
  findForSelect(query: SelectOptionsQueryDto & { isActive?: boolean }): Promise<SelectQueryResult> {
    this.logger.log(
      `Fetched billing cycle select options (limit: ${query.limit}, offset: ${query.offset}, search: ${query.search})`,
    );
    return this.billingCycleRepository.findForSelect({
      value: query.valueKey || 'id',
      label: query.labelKey || 'name',
      description: query.descriptionKey,
      groupIdKey: query.groupIdKey,
      search: query.search,
      limit: query.limit,
      offset: query.offset,
      values: query.values,
      excludeIds: query.excludeIds,
      where: query.isActive !== undefined ? { isActive: query.isActive } : undefined,
      orderBy: { sortOrder: 'asc', name: 'asc' },
    });
  }

  // Creates a new billing cycle; throws ConflictException on duplicate name
  async create(dto: CreateBillingCycleDto): Promise<CreateResponseDto<BillingCycleDto>> {
    const existing = await this.billingCycleRepository.findByName(dto.name);
    if (existing) {
      throw new ConflictException({
        label: 'Duplicate Name',
        detail: 'A billing cycle with this name already exists. Please use a different name.',
        errors: [{ field: 'name', message: 'Name already exists' }],
      });
    }
    const billingCycle = await this.billingCycleRepository.create(dto);
    this.logger.log(`Created billing cycle: ${billingCycle.name} (${billingCycle.id})`);
    return {
      success: true,
      message: `Billing cycle "${billingCycle.name}" created successfully.`,
      data: BillingCycleDto.from(billingCycle),
    };
  }

  // Returns billing cycles for the data table, applying server-stored filter/sort/search/pagination state
  async findForTable(userId: string): Promise<BillingCycleTableResponseDto> {
    const { state, activeViewId } = await this.dataTableStateService.getCurrentState(userId, 'billing-cycles');
    const where = and(
      FilterProcessor.buildWhere(state.filters, BillingCycleService.FIELD_MAP),
      FilterProcessor.buildSearch(state.search, BillingCycleService.FIELD_MAP),
    );
    const { limit = 20, offset = 0 } = state.pagination ?? {};
    const { rows, total } = await this.billingCycleRepository.findAllForTable({
      where,
      orderBy: FilterProcessor.buildOrderBy(state.sort, BillingCycleService.FIELD_MAP),
      limit,
      offset,
    });
    const result = rows.map(BillingCycleDto.from);
    this.logger.log(`Fetched billing cycles table (${total} results, limit: ${limit}, offset: ${offset})`);
    return { result, count: total, state, activeViewId };
  }

  // Finds a billing cycle by ID; throws NotFoundException if not found
  async findById(id: string): Promise<BillingCycleDto> {
    const billingCycle = await this.billingCycleRepository.findById(id);
    if (!billingCycle) {
      throw new NotFoundException('Billing cycle not found.');
    }
    this.logger.log(`Fetched billing cycle: ${id}`);
    return BillingCycleDto.from(billingCycle);
  }

  // Updates a billing cycle by ID; throws NotFoundException if not found, ConflictException on duplicate name
  async update(id: string, dto: UpdateBillingCycleDto): Promise<SuccessResponseDto> {
    const existing = await this.billingCycleRepository.findById(id);
    if (!existing) {
      throw new NotFoundException('Billing cycle not found.');
    }

    if (dto.name) {
      const existingName = await this.billingCycleRepository.findByName(dto.name);
      if (existingName && existingName.id !== id) {
        throw new ConflictException({
          label: 'Duplicate Name',
          detail: 'A billing cycle with this name already exists. Please use a different name.',
          errors: [{ field: 'name', message: 'Name already exists' }],
        });
      }
    }

    const billingCycle = await this.billingCycleRepository.update(id, dto);
    this.logger.log(`Updated billing cycle: ${billingCycle.name} (${billingCycle.id})`);
    return { success: true, message: `Billing cycle "${billingCycle.name}" updated successfully.` };
  }

  // Deletes a billing cycle by ID; throws NotFoundException if not found, ConflictException if prices reference it
  async delete(id: string): Promise<SuccessResponseDto> {
    const existing = await this.billingCycleRepository.findById(id);
    if (!existing) {
      throw new NotFoundException('Billing cycle not found.');
    }

    const priceCount = await this.planPriceRepository.countByBillingCycleId(id);
    if (priceCount > 0) {
      throw new ConflictException({
        label: 'Billing Cycle In Use',
        detail: `This billing cycle is used by ${priceCount} price(s). Remove those first.`,
      });
    }

    await this.billingCycleRepository.delete(id);
    this.logger.log(`Deleted billing cycle: ${existing.name} (${existing.id})`);
    return { success: true, message: `Billing cycle "${existing.name}" deleted successfully.` };
  }
}
