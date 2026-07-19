import { FeaturePermissionDomainService } from '@domain/version/feature/feature-permission/services/feature-permission.service';
import { Controller, Get, Logger, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { RequireSession } from '@vritti/api-sdk/auth';
import type { SelectQueryResult } from '@vritti/api-sdk/database';
import { SessionTypeValues } from '@/db/schema';
import { FeaturePermissionSelectQueryDto } from '../dto/feature-permission-select-query.dto';

@ApiTags('Select')
@ApiBearerAuth()
@RequireSession(SessionTypeValues.CLOUD, SessionTypeValues.ADMIN)
@Controller('feature-permissions')
export class FeaturePermissionSelectController {
  private readonly logger = new Logger(FeaturePermissionSelectController.name);

  constructor(private readonly featurePermissionService: FeaturePermissionDomainService) {}

  // Returns sibling permission options for the "depends on" selector, scoped to a feature
  @Get()
  findForSelect(@Query() query: FeaturePermissionSelectQueryDto): Promise<SelectQueryResult> {
    this.logger.log(`GET /select-api/feature-permissions?featureId=${query.featureId}`);
    return this.featurePermissionService.findForSelect(query);
  }
}
