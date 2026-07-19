import { AppCodeDomainService } from '@domain/app-code/services/app-code.service';
import { Controller, Get, Logger, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { RequireSession } from '@vritti/api-sdk/auth';
import { SelectOptionsQueryDto, type SelectQueryResult } from '@vritti/api-sdk/database';
import { SessionTypeValues } from '@/db/schema';

@ApiTags('Select')
@ApiBearerAuth()
@RequireSession(SessionTypeValues.CLOUD, SessionTypeValues.ADMIN)
@Controller('app-codes')
export class AppCodeSelectController {
  private readonly logger = new Logger(AppCodeSelectController.name);

  constructor(private readonly appCodeService: AppCodeDomainService) {}

  // Returns paginated app code options for the select component
  @Get()
  findForSelect(@Query() query: SelectOptionsQueryDto): Promise<SelectQueryResult> {
    this.logger.log('GET /select-api/app-codes');
    return this.appCodeService.findForSelect(query);
  }
}
