import { Injectable, Logger, type MessageEvent, OnModuleDestroy } from '@nestjs/common';
import { finalize, type Observable, Subject } from 'rxjs';
import type { DeploymentEventDto } from '../dto/entity/deployment-event.dto';

// Per-deployment SSE fan-out for the Activity tab — a pure relay of newly appended timeline events. The
// browser seeds the first page over HTTP (useDeploymentActivity) and keeps this stream open for live
// additions; each appended event is broadcast as an `activity-event`. No DB reads, no cache — the seed
// query owns history, this owns the live tail. Skips work when nobody is watching.
@Injectable()
export class DeploymentActivitySseService implements OnModuleDestroy {
  private readonly logger = new Logger(DeploymentActivitySseService.name);
  private readonly connections = new Map<string, Subject<MessageEvent>[]>();

  // Completes every open subject on shutdown so no stream is left dangling
  onModuleDestroy(): void {
    for (const [, subjects] of this.connections) {
      for (const subject of subjects) subject.complete();
    }
    this.connections.clear();
  }

  // Opens a live activity stream for one deployment. Self-cleans on browser disconnect (finalize).
  stream(deploymentId: string): Observable<MessageEvent> {
    const subject = new Subject<MessageEvent>();
    const list = this.connections.get(deploymentId) ?? [];
    list.push(subject);
    this.connections.set(deploymentId, list);
    this.logger.log(`Opened activity SSE for deployment ${deploymentId} (viewers: ${list.length})`);

    return subject.asObservable().pipe(finalize(() => this.removeConnection(deploymentId, subject)));
  }

  // Whether any browser is watching this deployment's activity (lets the relay skip work when nobody is)
  hasConnections(deploymentId: string): boolean {
    return (this.connections.get(deploymentId)?.length ?? 0) > 0;
  }

  // Relays a newly appended timeline event to watching browsers
  pushEvent(deploymentId: string, dto: DeploymentEventDto): void {
    const subjects = this.connections.get(deploymentId);
    if (!subjects?.length) return;
    const message: MessageEvent = { type: 'activity-event', data: JSON.stringify(dto) };
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
    this.logger.log(`Closed activity SSE for deployment ${deploymentId} (viewers: ${remaining.length})`);
  }
}
