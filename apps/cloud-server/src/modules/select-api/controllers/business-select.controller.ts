import { Controller, Get, Logger, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { RequireSession, SelectOptionsQueryDto, type SelectQueryResult } from '@vritti/api-sdk';
import { SessionTypeValues } from '@/db/schema';
import { BusinessService } from '@domain/business/services/business.service';

@ApiTags('Select')
@ApiBearerAuth()
@RequireSession(SessionTypeValues.CLOUD, SessionTypeValues.ADMIN)
@Controller('businesses')
export class BusinessSelectController {
  private readonly logger = new Logger(BusinessSelectController.name);

  constructor(private readonly businessService: BusinessService) {}

  // Returns paginated business options for the select component
  @Get()
  findForSelect(@Query() query: SelectOptionsQueryDto): Promise<SelectQueryResult> {
    this.logger.log('GET /select-api/businesses');
    return this.businessService.findForSelect(query);
  }
}
