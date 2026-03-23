import { Controller, Get, Logger, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { RequireSession, SelectOptionsQueryDto, type SelectQueryResult } from '@vritti/api-sdk';
import { SessionTypeValues } from '@/db/schema';
import { AppCodeService } from '@domain/app-code/services/app-code.service';

@ApiTags('Select')
@ApiBearerAuth()
@RequireSession(SessionTypeValues.CLOUD, SessionTypeValues.ADMIN)
@Controller('app-codes')
export class AppCodeSelectController {
  private readonly logger = new Logger(AppCodeSelectController.name);

  constructor(private readonly appCodeService: AppCodeService) {}

  // Returns paginated app code options for the select component
  @Get()
  findForSelect(@Query() query: SelectOptionsQueryDto): Promise<SelectQueryResult> {
    this.logger.log('GET /select-api/app-codes');
    return this.appCodeService.findForSelect(query);
  }
}
