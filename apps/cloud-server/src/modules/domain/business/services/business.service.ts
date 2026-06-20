import { Injectable, Logger } from '@nestjs/common';
import {
  ConflictException,
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
import { businesses } from '@/db/schema';
import { BusinessDto } from '@/modules/admin-api/business/dto/entity/business.dto';
import type { CreateBusinessDto } from '@/modules/admin-api/business/dto/request/create-business.dto';
import type { UpdateBusinessDto } from '@/modules/admin-api/business/dto/request/update-business.dto';
import { BusinessTableResponseDto } from '@/modules/admin-api/business/dto/response/businesses-response.dto';
import { CloudBusinessDto } from '@/modules/cloud-api/business/dto/entity/business.dto';
import { BusinessRepository } from '../repositories/business.repository';

@Injectable()
export class BusinessService {
  private readonly logger = new Logger(BusinessService.name);

  private static readonly FIELD_MAP: FieldMap = {
    name: { column: businesses.name, type: 'string' },
    code: { column: businesses.code, type: 'string' },
  };

  constructor(
    private readonly businessRepository: BusinessRepository,
    private readonly dataTableStateService: DataTableStateService,
  ) {}

  // Returns all businesses mapped to CloudBusinessDto
  async findAllForCloud(): Promise<CloudBusinessDto[]> {
    const businessList = await this.businessRepository.findAll();
    this.logger.log(`Fetched all businesses (${businessList.length})`);
    return businessList.map((business) => CloudBusinessDto.from(business));
  }

  // Returns paginated business options for the select component, optionally filtered by version membership
  findForSelect(query: SelectOptionsQueryDto, notInVersion?: string, inVersion?: string): Promise<SelectQueryResult> {
    this.logger.log(
      `Fetched business select options (limit: ${query.limit}, offset: ${query.offset}, search: ${query.search}, notInVersion: ${notInVersion}, inVersion: ${inVersion})`,
    );
    return this.businessRepository.findForSelectByVersion(
      {
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
      },
      notInVersion,
      inVersion,
    );
  }

  // Creates a new business; throws ConflictException on duplicate code
  async create(dto: CreateBusinessDto): Promise<CreateResponseDto<BusinessDto>> {
    const existingCode = await this.businessRepository.findByCode(dto.code);
    if (existingCode) {
      throw new ConflictException({
        label: 'Code Already Exists',
        detail: 'A business with this code already exists. Please choose a different code.',
        errors: [{ field: 'code', message: 'Duplicate code' }],
      });
    }
    const business = await this.businessRepository.create(dto);
    this.logger.log(`Created business: ${business.name} (${business.id})`);
    return {
      success: true,
      message: `Business "${business.name}" created successfully.`,
      data: BusinessDto.from(business, true),
    };
  }

  // Returns all businesses with server-stored filter/sort/pagination state applied, optionally narrowed by a search param
  async findForTable(userId: string, searchColumn?: string, searchValue?: string): Promise<BusinessTableResponseDto> {
    const { state, activeViewId } = await this.dataTableStateService.getCurrentState(userId, 'businesses');
    const filters: FilterCondition[] = [...state.filters];
    if (searchColumn && searchValue && BusinessService.FIELD_MAP[searchColumn]) {
      filters.push({ field: searchColumn, operator: 'contains', value: searchValue });
    }
    const where = FilterProcessor.buildWhere(filters, BusinessService.FIELD_MAP);
    const orderBy = FilterProcessor.buildOrderBy(state.sort, BusinessService.FIELD_MAP);
    const { limit = 20, offset = 0 } = state.pagination ?? {};
    const { result, count } = await this.businessRepository.findAllAndCount({ where, orderBy, limit, offset });
    const referencedIds = await this.businessRepository.findReferencedIds(result.map((r) => r.id));
    this.logger.log(`Fetched businesses table (${count} results, limit: ${limit}, offset: ${offset})`);
    return { result: result.map((r) => BusinessDto.from(r, !referencedIds.has(r.id))), count, state, activeViewId };
  }

  // Updates a business by ID; throws NotFoundException if not found, ConflictException on duplicate code
  async update(id: string, dto: UpdateBusinessDto): Promise<SuccessResponseDto> {
    const existing = await this.businessRepository.findById(id);
    if (!existing) {
      throw new NotFoundException('Business not found.');
    }
    if (dto.code) {
      const existingCode = await this.businessRepository.findByCode(dto.code);
      if (existingCode && existingCode.id !== id) {
        throw new ConflictException({
          label: 'Code Already Exists',
          detail: 'A business with this code already exists. Please choose a different code.',
          errors: [{ field: 'code', message: 'Duplicate code' }],
        });
      }
    }
    const business = await this.businessRepository.update(id, dto);
    this.logger.log(`Updated business: ${business.name} (${business.id})`);
    return { success: true, message: `Business "${business.name}" updated successfully.` };
  }

  // Deletes a business by ID; throws NotFoundException if not found, ConflictException if referenced
  async delete(id: string): Promise<SuccessResponseDto> {
    const existing = await this.businessRepository.findById(id);
    if (!existing) {
      throw new NotFoundException('Business not found.');
    }
    const refs = await this.businessRepository.countReferences(id);
    const parts: string[] = [];
    if (refs.organizations > 0) parts.push(`${refs.organizations} organization${refs.organizations > 1 ? 's' : ''}`);
    if (refs.plans > 0) parts.push(`${refs.plans} plan${refs.plans > 1 ? 's' : ''}`);
    if (refs.apps > 0) parts.push(`${refs.apps} app${refs.apps > 1 ? 's' : ''}`);
    if (refs.roleTemplates > 0) parts.push(`${refs.roleTemplates} role template${refs.roleTemplates > 1 ? 's' : ''}`);
    if (parts.length > 0) {
      throw new ConflictException({
        label: 'Business In Use',
        detail: `Cannot delete "${existing.name}" — it is referenced by ${parts.join(', ')}. Remove those references first.`,
      });
    }
    await this.businessRepository.delete(id);
    this.logger.log(`Deleted business: ${existing.name} (${existing.id})`);
    return { success: true, message: `Business "${existing.name}" deleted successfully.` };
  }
}
