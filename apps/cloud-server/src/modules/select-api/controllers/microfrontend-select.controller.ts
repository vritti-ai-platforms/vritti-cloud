import { Controller, Get, Logger, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { RequireSession } from '@vritti/api-sdk';
import { SessionTypeValues } from '@/db/schema';
import { MicrofrontendService } from '@domain/version/microfrontend/services/microfrontend.service';
import { MicrofrontendSelectQueryDto } from '../dto/microfrontend-select-query.dto';

@ApiTags('Select')
@ApiBearerAuth()
@RequireSession(SessionTypeValues.CLOUD, SessionTypeValues.ADMIN)
@Controller('microfrontends')
export class MicrofrontendSelectController {
  private readonly logger = new Logger(MicrofrontendSelectController.name);

  constructor(private readonly microfrontendService: MicrofrontendService) {}

  // Returns microfrontend options for a select component within a version
  @Get()
  findForSelect(
    @Query() query: MicrofrontendSelectQueryDto,
  ): Promise<{ options: Array<{ value: string; label: string }>; hasMore: boolean }> {
    this.logger.log('GET /select-api/microfrontends');
    return this.microfrontendService.findForSelect(query.versionId, query.search);
  }
}
