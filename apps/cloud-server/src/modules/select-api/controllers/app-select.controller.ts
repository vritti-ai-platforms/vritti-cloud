import { Controller, Get, Logger, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { RequireSession, type SelectQueryResult } from '@vritti/api-sdk';
import { SessionTypeValues } from '@/db/schema';
import { AppService } from '@domain/version/app/root/services/app.service';
import { AppSelectQueryDto } from '../dto/app-select-query.dto';

@ApiTags('Select')
@ApiBearerAuth()
@RequireSession(SessionTypeValues.CLOUD, SessionTypeValues.ADMIN)
@Controller('apps')
export class AppSelectController {
  private readonly logger = new Logger(AppSelectController.name);

  constructor(private readonly appService: AppService) {}

  // Returns paginated app options for the select component
  @Get()
  findForSelect(@Query() query: AppSelectQueryDto): Promise<SelectQueryResult> {
    this.logger.log('GET /select-api/apps');
    return this.appService.findForSelect(query);
  }
}
