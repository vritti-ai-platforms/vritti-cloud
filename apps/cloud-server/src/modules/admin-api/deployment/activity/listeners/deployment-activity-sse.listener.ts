import { DEPLOYMENT_EVENT_APPENDED_EVENT } from '@domain/deployment-event/services/deployment-event.service';
import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import type { DeploymentEvent } from '@/db/schema';
import { DeploymentEventDto } from '../dto/entity/deployment-event.dto';
import { DeploymentActivitySseService } from '../services/deployment-activity-sse.service';

// Bridges the domain's timeline-append emission to the per-deployment Activity SSE relay, so a new event
// reaches any watching browser live (no poll). Skips work when nobody is watching.
@Injectable()
export class DeploymentActivitySseListener {
  constructor(private readonly sse: DeploymentActivitySseService) {}

  // A timeline event was appended → relay it to watching browsers
  @OnEvent(DEPLOYMENT_EVENT_APPENDED_EVENT)
  handleEventAppended(event: DeploymentEvent): void {
    if (!this.sse.hasConnections(event.deploymentId)) return;
    this.sse.pushEvent(event.deploymentId, DeploymentEventDto.from(event));
  }
}
