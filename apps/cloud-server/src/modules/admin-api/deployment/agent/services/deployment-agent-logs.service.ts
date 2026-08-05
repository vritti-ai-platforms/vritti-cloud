import {
  AGENT_LOG_TAIL_LINES,
  DEPLOYMENT_AGENT_LOG_LINE_EVENT,
  DEPLOYMENT_AGENT_START_LOGS_EVENT,
  DEPLOYMENT_AGENT_STOP_LOGS_EVENT,
} from '@domain/deployment-agent/deployment-agent.constants';
import { Injectable, Logger, type MessageEvent, OnModuleDestroy } from '@nestjs/common';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { concat, finalize, from, type Observable, Subject } from 'rxjs';
import type { LogLineDto } from '../dto/entity/log-line.dto';

// Request-driven live-log relay: a container is tailed by the agent only while at least one browser is
// watching it. On the first viewer of a (deployment, target) it asks the agent to StartLogs; on the last it
// asks it to StopLogs. Lines the agent streams up (via the Connect StreamLogs handler → an event) are fanned
// out to viewers, with a small ring buffer so a late/second viewer gets recent context. Pure relay — no DB.
@Injectable()
export class DeploymentAgentLogsService implements OnModuleDestroy {
  private readonly logger = new Logger(DeploymentAgentLogsService.name);
  private readonly viewers = new Map<string, Subject<MessageEvent>[]>();
  private readonly ring = new Map<string, LogLineDto[]>();

  constructor(private readonly eventEmitter: EventEmitter2) {}

  onModuleDestroy(): void {
    for (const [, subjects] of this.viewers) {
      for (const subject of subjects) subject.complete();
    }
    this.viewers.clear();
  }

  // Opens a log stream for one container. On the first viewer, asks the agent to start tailing; replays the
  // ring buffer so a late viewer gets context; self-cleans (and asks the agent to stop) on the last viewer.
  stream(deploymentId: string, target: string): Observable<MessageEvent> {
    const key = logKey(deploymentId, target);
    const subject = new Subject<MessageEvent>();
    const list = this.viewers.get(key) ?? [];
    list.push(subject);
    this.viewers.set(key, list);
    this.logger.log(`Opened log stream ${key} (viewers: ${list.length})`);

    if (list.length === 1) {
      this.eventEmitter.emit(DEPLOYMENT_AGENT_START_LOGS_EVENT, {
        deploymentId,
        target,
        tailLines: AGENT_LOG_TAIL_LINES,
      });
    }

    const backlog = (this.ring.get(key) ?? []).map(lineMessage);
    return concat(from(backlog), subject.asObservable()).pipe(
      finalize(() => this.removeViewer(deploymentId, target, subject)),
    );
  }

  // A line the agent tailed (relayed from the Connect StreamLogs handler) → buffer + fan out to viewers.
  @OnEvent(DEPLOYMENT_AGENT_LOG_LINE_EVENT)
  handleLogLine(payload: { deploymentId: string; target: string; stream: string; ts: string; line: string }): void {
    const key = logKey(payload.deploymentId, payload.target);
    const subjects = this.viewers.get(key);
    if (!subjects?.length) return;
    const dto: LogLineDto = { target: payload.target, stream: payload.stream, ts: payload.ts, line: payload.line };
    const buffer = this.ring.get(key) ?? [];
    buffer.push(dto);
    if (buffer.length > AGENT_LOG_TAIL_LINES) buffer.shift();
    this.ring.set(key, buffer);
    for (const subject of subjects) {
      if (!subject.closed) subject.next(lineMessage(dto));
    }
  }

  private removeViewer(deploymentId: string, target: string, subject: Subject<MessageEvent>): void {
    const key = logKey(deploymentId, target);
    const list = this.viewers.get(key);
    if (!list) return;
    const remaining = list.filter((s) => s !== subject);
    if (remaining.length === 0) {
      this.viewers.delete(key);
      this.ring.delete(key);
      this.eventEmitter.emit(DEPLOYMENT_AGENT_STOP_LOGS_EVENT, { deploymentId, target });
    } else {
      this.viewers.set(key, remaining);
    }
    subject.complete();
    this.logger.log(`Closed log stream ${key} (viewers: ${remaining.length})`);
  }
}

function logKey(deploymentId: string, target: string): string {
  return `${deploymentId}::${target}`;
}

function lineMessage(dto: LogLineDto): MessageEvent {
  return { type: 'log-line', data: JSON.stringify(dto) };
}
