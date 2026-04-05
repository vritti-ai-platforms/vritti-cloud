import { Controller, Get, Logger, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { RequireSession, SelectOptionsQueryDto, type SelectQueryResult } from '@vritti/api-sdk';
import { SessionTypeValues } from '@/db/schema';
import { IndustryService } from '@domain/industry/services/industry.service';

@ApiTags('Select')
@ApiBearerAuth()
@RequireSession(SessionTypeValues.CLOUD, SessionTypeValues.ADMIN)
@Controller('industries')
export class IndustrySelectController {
  private readonly logger = new Logger(IndustrySelectController.name);

  constructor(private readonly industryService: IndustryService) {}

  // Returns paginated industry options for the select component
  @Get()
  findForSelect(@Query() query: SelectOptionsQueryDto): Promise<SelectQueryResult> {
    this.logger.log('GET /select-api/industries');
    return this.industryService.findForSelect(query);
  }
}
