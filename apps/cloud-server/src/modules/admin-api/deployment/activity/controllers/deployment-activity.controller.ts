import { DeploymentEventDomainService } from '@domain/deployment-event/services/deployment-event.service';
import { Controller, Get, Logger, type MessageEvent, Param, Query, Sse } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { RequireSession } from '@vritti/api-sdk/auth';
import type { Observable } from 'rxjs';
import { SessionTypeValues } from '@/db/schema';
import { ApiGetActivity, ApiStreamActivity } from '../docs/deployment-activity.docs';
import { DeploymentEventDto } from '../dto/entity/deployment-event.dto';
import { DeploymentEventsResponseDto } from '../dto/response/deployment-events-response.dto';
import { DeploymentActivitySseService } from '../services/deployment-activity-sse.service';

@ApiTags('Admin - Deployment Activity')
@ApiBearerAuth()
@RequireSession(SessionTypeValues.ADMIN)
@Controller('deployments/:id/activity')
export class DeploymentActivityController {
  private readonly logger = new Logger(DeploymentActivityController.name);

  constructor(
    private readonly eventService: DeploymentEventDomainService,
    private readonly sseService: DeploymentActivitySseService,
  ) {}

  // Returns a newest-first, cursor-paginated page of the deployment's activity timeline
  @Get()
  @ApiGetActivity()
  async getActivity(@Param('id') id: string, @Query('cursor') cursor?: string): Promise<DeploymentEventsResponseDto> {
    this.logger.log(`GET /admin-api/deployments/${id}/activity`);
    const page = await this.eventService.listByDeployment(id, cursor);
    return { result: page.events.map((event) => DeploymentEventDto.from(event)), nextCursor: page.nextCursor };
  }

  // Streams new activity-timeline entries via SSE (authenticated by the admin session cookie)
  @Sse('stream')
  @ApiStreamActivity()
  streamActivity(@Param('id') id: string): Observable<MessageEvent> {
    this.logger.log(`SSE /admin-api/deployments/${id}/activity/stream`);
    return this.sseService.stream(id);
  }
}
