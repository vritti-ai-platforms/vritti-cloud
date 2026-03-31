import { Controller, Get, Logger, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { RequireSession, type SelectQueryResult } from '@vritti/api-sdk';
import { SessionTypeValues } from '@/db/schema';
import { AppCodeService } from '@domain/app-code/services/app-code.service';
import { FeatureService } from '@domain/version/feature/root/services/feature.service';
import { FeatureSelectQueryDto } from '../dto/feature-select-query.dto';

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

  // Returns paginated feature options, optionally filtered by app code or versionId
  @Get()
  findForSelect(@Query() query: FeatureSelectQueryDto): Promise<SelectQueryResult> {
    this.logger.log(`GET /select-api/features${query.appCode ? `?appCode=${query.appCode}` : ''}`);
    if (query.appCode) return this.appCodeService.findFeatureCodesForSelect(query.appCode, query);
    return this.featureService.findForSelect(query);
  }
}
