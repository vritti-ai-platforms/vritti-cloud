import { BusinessService } from '@domain/business/services/business.service';
import { Controller, Get, Logger, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { RequireSession } from '@vritti/api-sdk/auth';
import type { SelectQueryResult } from '@vritti/api-sdk/database';
import { SessionTypeValues } from '@/db/schema';
import { BusinessSelectQueryDto } from '../dto/business-select-query.dto';

@ApiTags('Select')
@ApiBearerAuth()
@RequireSession(SessionTypeValues.CLOUD, SessionTypeValues.ADMIN)
@Controller('businesses')
export class BusinessSelectController {
  private readonly logger = new Logger(BusinessSelectController.name);

  constructor(private readonly businessService: BusinessService) {}

  // Returns paginated business options for the select component, optionally excluding businesses already assigned to a version
  @Get()
  findForSelect(@Query() query: BusinessSelectQueryDto): Promise<SelectQueryResult> {
    this.logger.log('GET /select-api/businesses');
    return this.businessService.findForSelect(query, query.notInVersion, query.inVersion);
  }
}
