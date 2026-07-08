import { CountryService } from '@domain/country/services/country.service';
import { Controller, Get, Logger, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { RequireSession } from '@vritti/api-sdk/auth';
import type { SelectQueryResult } from '@vritti/api-sdk/database';
import { SessionTypeValues } from '@/db/schema';
import { CountrySelectQueryDto } from '../dto/country-select-query.dto';

@ApiTags('Select')
@ApiBearerAuth()
@RequireSession(SessionTypeValues.CLOUD, SessionTypeValues.ADMIN)
@Controller('countries')
export class CountrySelectController {
  private readonly logger = new Logger(CountrySelectController.name);

  constructor(private readonly countryService: CountryService) {}

  // Returns paginated country options for the select component
  @Get()
  findForSelect(@Query() query: CountrySelectQueryDto): Promise<SelectQueryResult> {
    this.logger.log('GET /select-api/countries');
    return this.countryService.findForSelect(query);
  }
}
