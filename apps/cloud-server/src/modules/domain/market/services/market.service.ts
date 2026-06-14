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
import { markets } from '@/db/schema';
import { MarketDto } from '@/modules/admin-api/market/root/dto/entity/market.dto';
import type { CreateMarketDto } from '@/modules/admin-api/market/root/dto/request/create-market.dto';
import type { UpdateMarketDto } from '@/modules/admin-api/market/root/dto/request/update-market.dto';
import { MarketTableResponseDto } from '@/modules/admin-api/market/root/dto/response/markets-response.dto';
import { MarketRepository } from '../repositories/market.repository';

@Injectable()
export class MarketService {
  private readonly logger = new Logger(MarketService.name);

  private static readonly FIELD_MAP: FieldMap = {
    code: { column: markets.code, type: 'string' },
    name: { column: markets.name, type: 'string' },
    currencyCode: { column: markets.currencyCode, type: 'string' },
    isActive: { column: markets.isActive, type: 'boolean' },
  };

  constructor(
    private readonly marketRepository: MarketRepository,
    private readonly dataTableStateService: DataTableStateService,
  ) {}

  // Returns paginated market options for the select component
  findForSelect(query: SelectOptionsQueryDto & { isActive?: boolean }): Promise<SelectQueryResult> {
    this.logger.log(
      `Fetched market select options (limit: ${query.limit}, offset: ${query.offset}, search: ${query.search})`,
    );
    return this.marketRepository.findForSelect({
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
      orderBy: { name: 'asc' },
    });
  }

  // Creates a new market; throws ConflictException on duplicate code
  async create(dto: CreateMarketDto): Promise<CreateResponseDto<MarketDto>> {
    const existing = await this.marketRepository.findByCode(dto.code);
    if (existing) {
      throw new ConflictException({
        label: 'Code Already Exists',
        detail: 'A market with this code already exists. Please choose a different code.',
        errors: [{ field: 'code', message: 'Duplicate code' }],
      });
    }
    const market = await this.marketRepository.create(dto);
    this.logger.log(`Created market: ${market.name} (${market.id})`);
    return { success: true, message: `Market "${market.name}" created successfully.`, data: MarketDto.from(market) };
  }

  // Returns markets for the data table with server-stored filter/sort/search/pagination state
  async findForTable(userId: string): Promise<MarketTableResponseDto> {
    const { state, activeViewId } = await this.dataTableStateService.getCurrentState(userId, 'markets');
    const where = and(
      FilterProcessor.buildWhere(state.filters, MarketService.FIELD_MAP),
      FilterProcessor.buildSearch(state.search, MarketService.FIELD_MAP),
    );
    const { limit = 20, offset = 0 } = state.pagination ?? {};
    const { rows, total } = await this.marketRepository.findAllWithCounts({
      where,
      orderBy: FilterProcessor.buildOrderBy(state.sort, MarketService.FIELD_MAP),
      limit,
      offset,
    });
    const result = rows.map((market) => MarketDto.from(market, market.countryCount));
    this.logger.log(`Fetched markets table (${total} results, limit: ${limit}, offset: ${offset})`);
    return { result, count: total, state, activeViewId };
  }

  // Finds a market by ID with canDelete flag; throws NotFoundException if not found
  async findById(id: string): Promise<MarketDto> {
    const market = await this.marketRepository.findById(id);
    if (!market) {
      throw new NotFoundException('Market not found.');
    }
    const refs = await this.marketRepository.countReferences(id);
    const canDelete = refs.planPrices === 0 && refs.appPrices === 0 && refs.organizations === 0;
    this.logger.log(`Fetched market: ${id}`);
    return MarketDto.from(market, 0, canDelete);
  }

  // Updates a market by ID; throws NotFoundException if not found, ConflictException on duplicate code
  async update(id: string, dto: UpdateMarketDto): Promise<SuccessResponseDto> {
    const existing = await this.marketRepository.findById(id);
    if (!existing) {
      throw new NotFoundException('Market not found.');
    }
    if (dto.code) {
      const existingCode = await this.marketRepository.findByCode(dto.code);
      if (existingCode && existingCode.id !== id) {
        throw new ConflictException({
          label: 'Code Already Exists',
          detail: 'A market with this code already exists. Please choose a different code.',
          errors: [{ field: 'code', message: 'Duplicate code' }],
        });
      }
    }
    const market = await this.marketRepository.update(id, dto);
    this.logger.log(`Updated market: ${market.name} (${market.id})`);
    return { success: true, message: `Market "${market.name}" updated successfully.` };
  }

  // Deletes a market by ID; throws NotFoundException if not found, ConflictException if referenced
  async delete(id: string): Promise<SuccessResponseDto> {
    const existing = await this.marketRepository.findById(id);
    if (!existing) {
      throw new NotFoundException('Market not found.');
    }
    const refs = await this.marketRepository.countReferences(id);
    if (refs.planPrices > 0 || refs.appPrices > 0 || refs.organizations > 0) {
      throw new ConflictException({
        label: 'Market In Use',
        detail: `Cannot delete "${existing.name}" — it has prices or organization assignments. Remove those first.`,
      });
    }
    await this.marketRepository.delete(id);
    this.logger.log(`Deleted market: ${existing.name} (${existing.id})`);
    return { success: true, message: `Market "${existing.name}" deleted successfully.` };
  }
}
