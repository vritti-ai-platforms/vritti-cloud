import { CloudProviderService } from '@domain/cloud-provider/services/cloud-provider.service';
import { Controller, Get, Logger, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { RequireSession, type SelectQueryResult } from '@vritti/api-sdk';
import { SessionTypeValues } from '@/db/schema';
import { CloudProviderSelectQueryDto } from '../dto/cloud-provider-select-query.dto';

@ApiTags('Select')
@ApiBearerAuth()
@RequireSession(SessionTypeValues.CLOUD, SessionTypeValues.ADMIN)
@Controller('cloud-providers')
export class CloudProviderSelectController {
  private readonly logger = new Logger(CloudProviderSelectController.name);

  constructor(private readonly cloudProviderService: CloudProviderService) {}

  // Returns paginated cloud provider options for the select component
  @Get()
  findForSelect(@Query() query: CloudProviderSelectQueryDto): Promise<SelectQueryResult> {
    this.logger.log('GET /select-api/cloud-providers');
    return this.cloudProviderService.findForSelect(query);
  }
}
