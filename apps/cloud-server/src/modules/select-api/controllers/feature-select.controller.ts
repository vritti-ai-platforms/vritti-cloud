import { Controller, Get, Logger, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { RequireSession, SelectOptionsQueryDto, type SelectQueryResult } from '@vritti/api-sdk';
import { SessionTypeValues } from '@/db/schema';
import { AppCodeService } from '@domain/app-code/services/app-code.service';
import { FeatureService } from '@domain/version/feature/root/services/feature.service';

@ApiTags('Select')
@ApiBearerAuth()
@RequireSession(SessionTypeValues.CLOUD, SessionTypeValues.ADMIN)
@Controller('features')
export class FeatureSelectController {
  private readonly logger = new Logger(FeatureSelectController.name);

  constructor(
    private readonly featureService: FeatureService,
    private readonly appCodeService: AppCodeService,
  ) {}

  // Returns paginated feature options, optionally filtered by app code
  @Get()
  findForSelect(@Query() query: SelectOptionsQueryDto, @Query('appCode') appCode?: string) {
    this.logger.log(`GET /select-api/features${appCode ? `?appCode=${appCode}` : ''}`);
    if (appCode) {
      return this.appCodeService.findFeatureCodesForSelect(appCode, query);
    }
    return this.featureService.findForSelect(query);
  }
}
