import { DEPLOYMENT_AGENT_REQUEST_STATUS_EVENT } from '@domain/deployment-agent/deployment-agent.constants';
import { AgentConnectivityService } from '@domain/deployment-agent/services/agent-connectivity.service';
import { Injectable, Logger, type MessageEvent, OnModuleDestroy } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { concat, finalize, from, type Observable, Subject } from 'rxjs';
import type { AgentLiveStatusDto } from '../dto/entity/agent-live-status.dto';

// Per-deployment SSE fan-out for the admin cockpit — a pure relay of what the agent reports over Connect.
// It never reads the DB: live status is streamed straight through; a small in-memory cache holds only the
// LAST relayed status so a late/second viewer paints instantly. On a viewer opening, it asks the connected
// agent to report now (RequestStatus) so first paint is fresh and direct from the agent.
@Injectable()
export class DeploymentAgentSseService implements OnModuleDestroy {
  private readonly logger = new Logger(DeploymentAgentSseService.name);
  private readonly connections = new Map<string, Subject<MessageEvent>[]>();
  // Last relayed live status per deployment — an ephemeral relay buffer (not persistence), cleared on offline.
  private readonly lastStatus = new Map<string, AgentLiveStatusDto>();

  constructor(
    private readonly connectivity: AgentConnectivityService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  // Completes every open subject on shutdown so no stream is left dangling
  onModuleDestroy(): void {
    for (const [, subjects] of this.connections) {
      for (const subject of subjects) subject.complete();
    }
    this.connections.clear();
  }

  // Opens a stream for one deployment. Immediately emits current connectivity + the last relayed status (if
  // any) so the browser paints without waiting, then live updates. Asks the connected agent to report fresh
  // on the first viewer (or when there's nothing cached). Self-cleans on browser disconnect (finalize).
  stream(deploymentId: string): Observable<MessageEvent> {
    const subject = new Subject<MessageEvent>();
    const list = this.connections.get(deploymentId) ?? [];
    list.push(subject);
    this.connections.set(deploymentId, list);
    const firstViewer = list.length === 1;
    this.logger.log(`Opened agent SSE for deployment ${deploymentId} (viewers: ${list.length})`);

    const connected = this.connectivity.isConnected(deploymentId);
    const initial: MessageEvent[] = [connectivityMessage(connected)];
    const cached = this.lastStatus.get(deploymentId);
    if (cached) initial.push(statusMessage(cached));

    // Direct, on-demand first paint: nudge the connected agent to report now (no reconcile) so we relay
    // fresh state rather than serving anything stale/stored.
    if (connected && (firstViewer || !cached)) {
      this.eventEmitter.emit(DEPLOYMENT_AGENT_REQUEST_STATUS_EVENT, deploymentId);
    }

    return concat(from(initial), subject.asObservable()).pipe(
      finalize(() => this.removeConnection(deploymentId, subject)),
    );
  }

  // Whether any browser is currently watching this deployment (lets the relay skip work when nobody is)
  hasConnections(deploymentId: string): boolean {
    return (this.connections.get(deploymentId)?.length ?? 0) > 0;
  }

  // Relays a live status the agent just reported (and caches it as the last-known relay buffer)
  pushStatus(deploymentId: string, dto: AgentLiveStatusDto): void {
    this.lastStatus.set(deploymentId, dto);
    this.broadcast(deploymentId, statusMessage(dto));
  }

  // Relays an agent connectivity change; on going offline, drops the stale status cache (offline shows offline)
  pushConnectivity(deploymentId: string, connected: boolean): void {
    if (!connected) this.lastStatus.delete(deploymentId);
    this.broadcast(deploymentId, connectivityMessage(connected));
  }

  // Sends one message to all open subjects for a deployment
  private broadcast(deploymentId: string, message: MessageEvent): void {
    const subjects = this.connections.get(deploymentId);
    if (!subjects?.length) return;
    for (const subject of subjects) {
      if (!subject.closed) subject.next(message);
    }
  }

  // Removes a disconnected subject and drops the deployment key when the last stream closes
  private removeConnection(deploymentId: string, subject: Subject<MessageEvent>): void {
    const subjects = this.connections.get(deploymentId);
    if (!subjects) return;
    const remaining = subjects.filter((s) => s !== subject);
    if (remaining.length === 0) {
      this.connections.delete(deploymentId);
    } else {
      this.connections.set(deploymentId, remaining);
    }
    subject.complete();
    this.logger.log(`Closed agent SSE for deployment ${deploymentId} (viewers: ${remaining.length})`);
  }
}

// Wraps a live status DTO as a named SSE message the browser listens for via addEventListener('agent-status')
function statusMessage(dto: AgentLiveStatusDto): MessageEvent {
  return { type: 'agent-status', data: JSON.stringify(dto) };
}

// Connectivity message the browser listens for via addEventListener('agent-connectivity')
function connectivityMessage(connected: boolean): MessageEvent {
  return { type: 'agent-connectivity', data: JSON.stringify({ connected }) };
}
