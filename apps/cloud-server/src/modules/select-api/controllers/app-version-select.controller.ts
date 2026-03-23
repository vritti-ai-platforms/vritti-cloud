import { Controller, Get, Logger, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { RequireSession, SelectOptionsQueryDto, type SelectQueryResult } from '@vritti/api-sdk';
import { SessionTypeValues } from '@/db/schema';
import { AppVersionService } from '@domain/app-version/root/services/app-version.service';

@ApiTags('Select')
@ApiBearerAuth()
@RequireSession(SessionTypeValues.CLOUD, SessionTypeValues.ADMIN)
@Controller('app-versions')
export class AppVersionSelectController {
  private readonly logger = new Logger(AppVersionSelectController.name);

  constructor(private readonly appVersionService: AppVersionService) {}

  // Returns paginated app version options for the select component
  @Get()
  findForSelect(@Query() query: SelectOptionsQueryDto): Promise<SelectQueryResult> {
    this.logger.log('GET /select-api/app-versions');
    return this.appVersionService.findForSelect(query);
  }
}
