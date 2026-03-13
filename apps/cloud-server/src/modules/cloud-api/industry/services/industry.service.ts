import { Injectable, Logger } from '@nestjs/common';
import { SelectOptionsQueryDto, type SelectQueryResult } from '@vritti/api-sdk';
import { IndustryDto } from '../dto/entity/industry.dto';
import { IndustryRepository } from '../repositories/industry.repository';

@Injectable()
export class IndustryService {
  private readonly logger = new Logger(IndustryService.name);

  constructor(private readonly industryRepository: IndustryRepository) {}

  // Returns all industries mapped to IndustryDto
  async findAll(): Promise<IndustryDto[]> {
    const industries = await this.industryRepository.findAll();
    this.logger.log(`Fetched all industries (${industries.length})`);
    return industries.map((industry) => IndustryDto.from(industry));
  }

  // Returns paginated industry options for select component
  findForSelect(query: SelectOptionsQueryDto): Promise<SelectQueryResult> {
    this.logger.log(`Fetched industry select options (limit: ${query.limit}, offset: ${query.offset}, search: ${query.search})`);
    return this.industryRepository.findForSelect({
      value: query.valueKey || 'id',
      label: query.labelKey || 'name',
      description: query.descriptionKey,
      search: query.search,
      limit: query.limit,
      offset: query.offset,
      values: query.values,
      excludeIds: query.excludeIds,
      orderBy: { name: 'asc' },
    });
  }
}
