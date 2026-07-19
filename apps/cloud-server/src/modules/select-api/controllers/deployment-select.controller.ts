import { DeploymentDomainService } from '@domain/deployment/services/deployment.service';
import { Controller, Get, Logger, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { RequireSession } from '@vritti/api-sdk/auth';
import type { SelectQueryResult } from '@vritti/api-sdk/database';
import { SessionTypeValues } from '@/db/schema';
import { DeploymentSelectQueryDto } from '../../admin-api/deployment/dto/request/deployment-select-query.dto';

@ApiTags('Select')
@ApiBearerAuth()
@RequireSession(SessionTypeValues.CLOUD, SessionTypeValues.ADMIN)
@Controller('deployments')
export class DeploymentSelectController {
  private readonly logger = new Logger(DeploymentSelectController.name);

  constructor(private readonly deploymentService: DeploymentDomainService) {}

  // Returns paginated deployment options for the select component
  @Get()
  findForSelect(@Query() query: DeploymentSelectQueryDto): Promise<SelectQueryResult> {
    this.logger.log('GET /select-api/deployments');
    return this.deploymentService.findForSelect(query);
  }
}
