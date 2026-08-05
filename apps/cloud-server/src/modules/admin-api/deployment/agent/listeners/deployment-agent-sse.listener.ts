import {
  DEPLOYMENT_AGENT_CONNECTIVITY_CHANGED_EVENT,
  DEPLOYMENT_AGENT_STATUS_CHANGED_EVENT,
} from '@domain/deployment-agent/deployment-agent.constants';
import type { AgentStatusChangedEvent } from '@domain/deployment-agent/services/deployment-agent.service';
import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { AgentLiveStatusDto } from '../dto/entity/agent-live-status.dto';
import { DeploymentAgentSseService } from '../services/deployment-agent-sse.service';

// Bridges the domain's status/connectivity emissions to the per-deployment agent SSE relay. The live status
// is built straight from the agent's reported payload (no DB read); connectivity is relayed so the cockpit
// flips to "offline" the instant the agent's stream drops. Skips work when no browser is watching.
// (Timeline events have their own Activity SSE — see deployment-activity-sse.listener.ts.)
@Injectable()
export class DeploymentAgentSseListener {
  constructor(private readonly sse: DeploymentAgentSseService) {}

  // Agent reported status → relay it straight to watching browsers (built from the report, not the DB)
  @OnEvent(DEPLOYMENT_AGENT_STATUS_CHANGED_EVENT)
  handleStatusChanged(payload: AgentStatusChangedEvent): void {
    const deploymentId = payload.agent.deploymentId;
    if (!this.sse.hasConnections(deploymentId)) return;
    this.sse.pushStatus(deploymentId, AgentLiveStatusDto.from(payload.agent, payload.report));
  }

  // Agent stream opened/closed → relay online/offline to watching browsers
  @OnEvent(DEPLOYMENT_AGENT_CONNECTIVITY_CHANGED_EVENT)
  handleConnectivityChanged(payload: { deploymentId: string; connected: boolean }): void {
    if (!this.sse.hasConnections(payload.deploymentId)) return;
    this.sse.pushConnectivity(payload.deploymentId, payload.connected);
  }
}
