import { Injectable, Logger } from '@nestjs/common';
import { type SelectOptionsQueryDto, type SelectQueryResult } from '@vritti/api-sdk';
import { AppCodeRepository } from '../repositories/app-code.repository';

@Injectable()
export class AppCodeService {
  private readonly logger = new Logger(AppCodeService.name);

  constructor(private readonly appCodeRepository: AppCodeRepository) {}

  // Returns distinct feature codes for a given app code
  findFeatureCodesForSelect(appCode: string, query: SelectOptionsQueryDto) {
    this.logger.log(`Fetched feature codes for app ${appCode} (search: ${query.search})`);
    return this.appCodeRepository.findFeatureCodesByAppCode(appCode, {
      search: query.search,
      limit: query.limit,
      offset: query.offset,
    });
  }

  // Returns distinct app codes with names for the select component
  findForSelect(query: SelectOptionsQueryDto): Promise<SelectQueryResult> {
    this.logger.log(`Fetched app code select options (search: ${query.search})`);
    return this.appCodeRepository.findForSelect({
      distinct: true,
      value: query.valueKey || 'code',
      label: query.labelKey || 'name',
      description: query.descriptionKey || 'code',
      search: query.search,
      limit: query.limit,
      offset: query.offset,
      values: query.values,
      excludeIds: query.excludeIds,
      orderBy: { name: 'asc' },
    });
  }
}
