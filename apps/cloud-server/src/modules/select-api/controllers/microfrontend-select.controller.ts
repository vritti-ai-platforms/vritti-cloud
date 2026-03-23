import { Controller, Get, Logger, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { RequireSession } from '@vritti/api-sdk';
import { SessionTypeValues } from '@/db/schema';
import { MicrofrontendService } from '@domain/app-version/microfrontend/services/microfrontend.service';

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
    @Query('versionId') versionId: string,
    @Query('search') search?: string,
  ): Promise<{ options: Array<{ value: string; label: string }>; hasMore: boolean }> {
    this.logger.log('GET /select-api/microfrontends');
    return this.microfrontendService.findForSelect(versionId, search);
  }
}
