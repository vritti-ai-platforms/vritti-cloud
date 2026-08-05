import type { MessageInitShape } from '@bufbuild/protobuf';
import { Code, ConnectError, type ConnectRouter, type HandlerContext, type Interceptor } from '@connectrpc/connect';
import {
  AGENT_SUBSCRIBE_KEEPALIVE_MS,
  DEPLOYMENT_AGENT_LOG_LINE_EVENT,
  DEPLOYMENT_AGENT_REQUEST_STATUS_EVENT,
  DEPLOYMENT_AGENT_START_LOGS_EVENT,
  DEPLOYMENT_AGENT_STOP_LOGS_EVENT,
  DEPLOYMENT_DESIRED_STATE_CHANGED_EVENT,
} from '@domain/deployment-agent/deployment-agent.constants';
import type { EnrollRequestDto } from '@domain/deployment-agent/dto/request/enroll-request.dto';
import type {
  CertificateReportDto,
  ConditionDto,
  StatusEventDto,
  StatusReportDto,
} from '@domain/deployment-agent/dto/request/status-report.dto';
import { AgentConnectivityService } from '@domain/deployment-agent/services/agent-connectivity.service';
import { DeploymentAgentDomainService } from '@domain/deployment-agent/services/deployment-agent.service';
import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  AgentService,
  type EnrollRequest,
  type EnrollResponseSchema,
  type LogBatch,
  type PushLogsAckSchema,
  type ReportAckSchema,
  type ServerMessageSchema,
  type StatusReport,
  type SubscribeRequest,
} from '@/gen/agent/v1/agent_pb';
import { createAgentAuthInterceptor } from './agent-auth.interceptor';
import { agentSignedMessage } from './agent-connect.auth';
import { kAgent } from './agent-connect.context';

// Connect implementation of agent.v1.AgentService. Thin transport layer: every handler delegates to
// DeploymentAgentDomainService (enroll / getSignedDesiredState / recordStatus). The desired-state crypto
// contract is preserved exactly — SignedDesiredState carries the canonical-JSON string + signature, never
// proto-encoded fields (protobuf isn't canonical across Go/TS, which would break the signature).
@Injectable()
export class AgentConnectService {
  private readonly logger = new Logger(AgentConnectService.name);

  constructor(
    private readonly domain: DeploymentAgentDomainService,
    private readonly connectivity: AgentConnectivityService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  // Registers all AgentService RPCs on the Connect router (mounted on Fastify in main.ts)
  registerRoutes(router: ConnectRouter): void {
    router.service(AgentService, {
      enroll: (req, ctx) => this.enroll(req, ctx),
      subscribe: (req, ctx) => this.subscribe(req, ctx),
      reportStatus: (req, ctx) => this.reportStatus(req, ctx),
      pushLogs: (req, ctx) => this.pushLogs(req, ctx),
    });
  }

  // The Ed25519 auth interceptor for this service (skips Enroll; verifies + attaches the agent to context)
  authInterceptor(): Interceptor {
    return createAgentAuthInterceptor(this.domain);
  }

  // Enroll — one-time trust-on-first-use handshake. No enrolled agent yet, so auth is done in the handler:
  // the domain verifies the presented signing key signed `<ts>.<deploymentId>` and burns the enroll token.
  private async enroll(
    req: EnrollRequest,
    ctx: HandlerContext,
  ): Promise<MessageInitShape<typeof EnrollResponseSchema>> {
    try {
      const dto: EnrollRequestDto = {
        deploymentId: req.deploymentId,
        enrollToken: req.enrollToken,
        signingPubKey: req.signingPubKey,
        sealingPubKey: req.sealingPubKey || undefined,
        agentVersion: req.agentVersion || undefined,
      };
      const result = await this.domain.enroll(dto, {
        deploymentId: req.deploymentId,
        agentKeyB64: ctx.requestHeader.get('x-vritti-agent-key') ?? undefined,
        signatureB64: ctx.requestHeader.get('x-vritti-signature') ?? undefined,
        rawBody: agentSignedMessage(ctx.requestHeader, req.deploymentId),
        bearer: undefined,
      });
      this.logger.log(`Connect Enroll for deployment ${req.deploymentId}`);
      return {
        agentCredential: result.agentCredential,
        deploymentPubKey: result.deploymentPubKey,
        nonce: result.nonce,
        nonceSignature: result.nonceSignature,
      };
    } catch (err) {
      throw toConnectError(err);
    }
  }

  // Subscribe — the single cloud→agent push stream. Marks the agent connected for the stream's lifetime
  // (drives the cockpit's online/offline state) and drains an outbound frame queue fed by internal events:
  // a desired-state change → SignedDesiredState; request-status → RequestStatus command; start/stop-logs (a
  // browser opened/closed a log view) → StartLogs/StopLogs command; a keepalive tick → KeepAlive (CF
  // idle-timeout guard). Extensible: new command types are just another event → push.
  private async *subscribe(
    req: SubscribeRequest,
    ctx: HandlerContext,
  ): AsyncIterable<MessageInitShape<typeof ServerMessageSchema>> {
    const agent = ctx.values.get(kAgent);
    const deploymentId = req.deploymentId;
    if (!agent || agent.deploymentId !== deploymentId) {
      throw new ConnectError('Subscribe deploymentId does not match the authenticated agent.', Code.PermissionDenied);
    }
    this.logger.log(`Agent subscribed to deployment ${deploymentId}`);
    this.connectivity.markConnected(deploymentId);

    const queue: MessageInitShape<typeof ServerMessageSchema>[] = [];
    let wake: (() => void) | null = null;
    const push = (frame: MessageInitShape<typeof ServerMessageSchema>): void => {
      queue.push(frame);
      wake?.();
      wake = null;
    };

    // Push a fresh desired-state only when its generation actually moved (getSignedDesiredState is idempotent).
    let lastGeneration = -1;
    const pushDesiredStateIfChanged = async (): Promise<void> => {
      const signed = await this.domain.getSignedDesiredState(deploymentId);
      const generation = readGeneration(signed.payloadB64);
      if (generation !== lastGeneration) {
        lastGeneration = generation;
        push({ msg: { case: 'desiredState', value: { payloadB64: signed.payloadB64, signature: signed.signature } } });
      }
    };

    const onChange = (id: string): void => {
      if (id === deploymentId) {
        void pushDesiredStateIfChanged().catch((err) => this.logger.warn(`desired-state push failed: ${err}`));
      }
    };
    const onRequestStatus = (id: string): void => {
      if (id === deploymentId)
        push({ msg: { case: 'command', value: { kind: { case: 'requestStatus', value: {} } } } });
    };
    const onStartLogs = (p: { deploymentId: string; target: string; tailLines?: number }): void => {
      if (p.deploymentId !== deploymentId) return;
      push({
        msg: {
          case: 'command',
          value: { kind: { case: 'startLogs', value: { target: p.target, tailLines: p.tailLines ?? 0, since: '' } } },
        },
      });
    };
    const onStopLogs = (p: { deploymentId: string; target: string }): void => {
      if (p.deploymentId !== deploymentId) return;
      push({ msg: { case: 'command', value: { kind: { case: 'stopLogs', value: { target: p.target } } } } });
    };
    const keepalive = setInterval(() => {
      push({ msg: { case: 'keepAlive', value: { unixTs: BigInt(Math.floor(Date.now() / 1000)) } } });
    }, AGENT_SUBSCRIBE_KEEPALIVE_MS);
    const onAbort = (): void => {
      wake?.();
      wake = null;
    };

    this.eventEmitter.on(DEPLOYMENT_DESIRED_STATE_CHANGED_EVENT, onChange);
    this.eventEmitter.on(DEPLOYMENT_AGENT_REQUEST_STATUS_EVENT, onRequestStatus);
    this.eventEmitter.on(DEPLOYMENT_AGENT_START_LOGS_EVENT, onStartLogs);
    this.eventEmitter.on(DEPLOYMENT_AGENT_STOP_LOGS_EVENT, onStopLogs);
    ctx.signal.addEventListener('abort', onAbort, { once: true });

    try {
      await pushDesiredStateIfChanged(); // initial desired-state on connect
      while (!ctx.signal.aborted) {
        if (queue.length === 0) {
          await new Promise<void>((resolve) => {
            wake = resolve;
          });
        }
        if (ctx.signal.aborted) break;
        const frame = queue.shift();
        if (frame) yield frame;
      }
    } catch (err) {
      if (ctx.signal.aborted) return; // client disconnected mid-eval — a normal stream close, not an error
      throw toConnectError(err);
    } finally {
      clearInterval(keepalive);
      this.eventEmitter.off(DEPLOYMENT_DESIRED_STATE_CHANGED_EVENT, onChange);
      this.eventEmitter.off(DEPLOYMENT_AGENT_REQUEST_STATUS_EVENT, onRequestStatus);
      this.eventEmitter.off(DEPLOYMENT_AGENT_START_LOGS_EVENT, onStartLogs);
      this.eventEmitter.off(DEPLOYMENT_AGENT_STOP_LOGS_EVENT, onStopLogs);
      ctx.signal.removeEventListener('abort', onAbort);
      this.connectivity.markDisconnected(deploymentId);
    }
    this.logger.log(`Agent unsubscribed from deployment ${deploymentId}`);
  }

  // ReportStatus — unary heartbeat pushed on every meaningful transition plus a periodic beat.
  private async reportStatus(
    req: StatusReport,
    ctx: HandlerContext,
  ): Promise<MessageInitShape<typeof ReportAckSchema>> {
    const agent = ctx.values.get(kAgent);
    if (!agent) {
      throw new ConnectError('Unauthenticated.', Code.Unauthenticated);
    }
    try {
      await this.domain.recordStatus(agent, toStatusReportDto(req));
      return {};
    } catch (err) {
      throw toConnectError(err);
    }
  }

  // PushLogs — the agent's unary batch of tailed container log lines (started/stopped via commands on
  // the Subscribe stream). Each line is relayed to the logs SSE fan-out via an event, keyed by deployment.
  private pushLogs(req: LogBatch, ctx: HandlerContext): MessageInitShape<typeof PushLogsAckSchema> {
    const agent = ctx.values.get(kAgent);
    if (!agent) {
      throw new ConnectError('Unauthenticated.', Code.Unauthenticated);
    }
    const deploymentId = agent.deploymentId;
    for (const line of req.lines) {
      this.eventEmitter.emit(DEPLOYMENT_AGENT_LOG_LINE_EVENT, {
        deploymentId,
        target: line.target,
        stream: line.stream,
        ts: line.ts,
        line: line.line,
      });
    }
    return {};
  }
}

// Reads the generation off the canonical desired-state JSON without disturbing the signed bytes
function readGeneration(payloadB64: string): number {
  try {
    return Number((JSON.parse(payloadB64) as { generation?: number }).generation ?? 0);
  } catch {
    return 0;
  }
}

// Maps api-sdk HttpExceptions (and anything else) thrown by the domain into a Connect status. The Nest
// HttpExceptionFilter does not run for Connect routes, so handlers translate errors themselves.
function toConnectError(err: unknown): ConnectError {
  if (err instanceof ConnectError) return err;
  const status = (err as { getStatus?: () => number }).getStatus?.();
  const message = err instanceof Error ? err.message : 'Internal error';
  const code =
    status === 401
      ? Code.Unauthenticated
      : status === 400
        ? Code.InvalidArgument
        : status === 404
          ? Code.NotFound
          : Code.Internal;
  return new ConnectError(message, code);
}

// Maps the proto StatusReport (uint64 fields arrive as bigint) to the domain StatusReportDto shape.
function toStatusReportDto(req: StatusReport): StatusReportDto {
  const conditions: ConditionDto[] = req.conditions.map((c) => ({
    type: c.type as ConditionDto['type'],
    status: c.status as ConditionDto['status'],
    reason: c.reason,
    message: c.message,
    component: (c.component || undefined) as ConditionDto['component'],
    since: c.since,
  }));
  const certificates: CertificateReportDto[] = req.certificates.map((cert) => ({
    host: cert.host,
    notAfter: cert.notAfter,
    issuedAt: cert.issuedAt,
  }));
  const events: StatusEventDto[] = req.events.map((e) => ({
    level: e.level as StatusEventDto['level'],
    component: e.component || undefined,
    reason: e.reason,
    message: e.message,
  }));
  return {
    deploymentId: req.deploymentId,
    generation: Number(req.generation),
    conditions,
    services: req.services.map((s) => ({
      component: s.component,
      service: s.service,
      name: s.name,
      state: s.state,
      health: s.health,
      cpuPercent: s.cpuPercent,
      memoryBytes: Number(s.memoryBytes),
    })),
    host: req.host
      ? {
          cpuPercent: req.host.cpuPercent,
          memTotalBytes: Number(req.host.memTotalBytes),
          memUsedBytes: Number(req.host.memUsedBytes),
          diskTotalBytes: Number(req.host.diskTotalBytes),
          diskUsedBytes: Number(req.host.diskUsedBytes),
        }
      : null,
    certificates,
    delegation: req.delegation
      ? {
          name: req.delegation.name,
          target: req.delegation.target,
          zone: req.delegation.zone,
          nameserver: req.delegation.nameserver,
          serverIp: req.delegation.serverIp,
        }
      : null,
    events,
  };
}
