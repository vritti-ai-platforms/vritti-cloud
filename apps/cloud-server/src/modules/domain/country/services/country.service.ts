import { Injectable, Logger } from '@nestjs/common';
import { DataTableStateService } from '@vritti/api-sdk/data-table';
import {
  CreateResponseDto,
  type FieldMap,
  FilterProcessor,
  SelectOptionsQueryDto,
  type SelectQueryResult,
  SuccessResponseDto,
} from '@vritti/api-sdk/database';
import { and } from '@vritti/api-sdk/drizzle-orm';
import { ConflictException, NotFoundException } from '@vritti/api-sdk/exceptions';
import { countries } from '@/db/schema';
import { CountryDto } from '@/modules/admin-api/country/dto/entity/country.dto';
import type { CreateCountryDto } from '@/modules/admin-api/country/dto/request/create-country.dto';
import type { UpdateCountryDto } from '@/modules/admin-api/country/dto/request/update-country.dto';
import { CountryTableResponseDto } from '@/modules/admin-api/country/dto/response/countries-response.dto';
import { CountryDomainRepository } from '../repositories/country.repository';

@Injectable()
export class CountryDomainService {
  private readonly logger = new Logger(CountryDomainService.name);

  private static readonly FIELD_MAP: FieldMap = {
    code: { column: countries.code, type: 'string' },
    name: { column: countries.name, type: 'string' },
    defaultCurrency: { column: countries.defaultCurrency, type: 'string' },
    taxRegime: { column: countries.taxRegime, type: 'string' },
    isActive: { column: countries.isActive, type: 'boolean' },
  };

  constructor(
    private readonly countryRepository: CountryDomainRepository,
    private readonly dataTableStateService: DataTableStateService,
  ) {}

  // Returns paginated country options for the select component
  findForSelect(query: SelectOptionsQueryDto & { isActive?: boolean }): Promise<SelectQueryResult> {
    this.logger.log(
      `Fetched country select options (limit: ${query.limit}, offset: ${query.offset}, search: ${query.search})`,
    );
    return this.countryRepository.findForSelect({
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

  // Creates a new country; throws ConflictException on duplicate code
  async create(dto: CreateCountryDto): Promise<CreateResponseDto<CountryDto>> {
    const existing = await this.countryRepository.findByCode(dto.code);
    if (existing) {
      throw new ConflictException({
        label: 'Duplicate Code',
        detail: 'A country with this code already exists. Please use a different code.',
        errors: [{ field: 'code', message: 'Code already exists' }],
      });
    }
    const country = await this.countryRepository.create(dto);
    this.logger.log(`Created country: ${country.name} (${country.id})`);
    return {
      success: true,
      message: `Country "${country.name}" created successfully.`,
      data: CountryDto.from(country),
    };
  }

  // Returns all countries with server-stored filter/sort/search/pagination state
  async findForTable(userId: string): Promise<CountryTableResponseDto> {
    const { state, activeViewId } = await this.dataTableStateService.getCurrentState(userId, 'countries');
    const where = and(
      FilterProcessor.buildWhere(state.filters, CountryDomainService.FIELD_MAP),
      FilterProcessor.buildSearch(state.search, CountryDomainService.FIELD_MAP),
    );
    const { limit = 20, offset = 0 } = state.pagination ?? {};
    const { rows, total } = await this.countryRepository.findAllWithCount({
      where,
      orderBy: FilterProcessor.buildOrderBy(state.sort, CountryDomainService.FIELD_MAP),
      limit,
      offset,
    });
    const result = rows.map((country) => CountryDto.from(country));
    this.logger.log(`Fetched countries table (${total} results, limit: ${limit}, offset: ${offset})`);
    return { result, count: total, state, activeViewId };
  }

  // Finds a country by ID with canDelete flag; throws NotFoundException if not found
  async findById(id: string): Promise<CountryDto> {
    const country = await this.countryRepository.findById(id);
    if (!country) {
      throw new NotFoundException('Country not found.');
    }
    const priceReferences = await this.countryRepository.countPriceReferences(id);
    this.logger.log(`Fetched country: ${id}`);
    return CountryDto.from(country, priceReferences === 0);
  }

  // Updates a country by ID; throws NotFoundException if not found, ConflictException on duplicate code
  async update(id: string, dto: UpdateCountryDto): Promise<SuccessResponseDto> {
    const existing = await this.countryRepository.findById(id);
    if (!existing) {
      throw new NotFoundException('Country not found.');
    }

    if (dto.code) {
      const existingCode = await this.countryRepository.findByCode(dto.code);
      if (existingCode && existingCode.id !== id) {
        throw new ConflictException({
          label: 'Duplicate Code',
          detail: 'A country with this code already exists. Please use a different code.',
          errors: [{ field: 'code', message: 'Code already exists' }],
        });
      }
    }

    const country = await this.countryRepository.update(id, dto);
    this.logger.log(`Updated country: ${country.name} (${country.id})`);
    return { success: true, message: `Country "${country.name}" updated successfully.` };
  }

  // Deletes a country by ID; throws NotFoundException if not found, ConflictException if market references exist
  async delete(id: string): Promise<SuccessResponseDto> {
    const existing = await this.countryRepository.findById(id);
    if (!existing) {
      throw new NotFoundException('Country not found.');
    }

    const priceReferences = await this.countryRepository.countPriceReferences(id);
    if (priceReferences > 0) {
      throw new ConflictException({
        label: 'Country In Use',
        detail: `This country cannot be deleted because it has ${priceReferences} plan/app price(s). Remove those prices first.`,
      });
    }

    await this.countryRepository.delete(id);
    this.logger.log(`Deleted country: ${existing.name} (${existing.id})`);
    return { success: true, message: `Country "${existing.name}" deleted successfully.` };
  }
}
