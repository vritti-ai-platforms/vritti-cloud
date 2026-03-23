import { Controller, Get, Logger, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { RequireSession, SelectOptionsQueryDto, type SelectQueryResult } from '@vritti/api-sdk';
import { SessionTypeValues } from '@/db/schema';
import { AppService } from '@domain/app-version/app/root/services/app.service';

@ApiTags('Select')
@ApiBearerAuth()
@RequireSession(SessionTypeValues.CLOUD, SessionTypeValues.ADMIN)
@Controller('apps')
export class AppSelectController {
  private readonly logger = new Logger(AppSelectController.name);

  constructor(private readonly appService: AppService) {}

  // Returns paginated app options for the select component
  @Get()
  findForSelect(@Query() query: SelectOptionsQueryDto): Promise<SelectQueryResult> {
    this.logger.log('GET /select-api/apps');
    return this.appService.findForSelect(query);
  }
}
