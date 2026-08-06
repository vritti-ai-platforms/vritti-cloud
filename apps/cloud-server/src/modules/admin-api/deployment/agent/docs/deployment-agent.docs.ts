import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { SuccessResponseDto } from '@vritti/api-sdk/database';
import { AgentStatusDto } from '../dto/entity/agent-status.dto';
import { EnrollTokenDto } from '../dto/response/enroll-token.dto';

export function ApiForceRecheck() {
  return applyDecorators(
    ApiOperation({
      summary: 'Force the agent to reconcile now',
      description:
        'Pushes a ForceRecheck command down the agent’s open stream, clearing its backoff and re-applying the desired state immediately — instead of waiting for the periodic resync. Requires the agent to be online.',
    }),
    ApiParam({ name: 'id', description: 'Deployment UUID', example: '550e8400-e29b-41d4-a716-446655440000' }),
    ApiResponse({ status: 200, description: 'Recheck requested.', type: SuccessResponseDto }),
    ApiResponse({ status: 400, description: 'Agent is offline.' }),
    ApiResponse({ status: 401, description: 'Unauthorized.' }),
    ApiResponse({ status: 404, description: 'Deployment not found.' }),
  );
}

export function ApiIssueEnrollToken() {
  return applyDecorators(
    ApiOperation({
      summary: 'Issue an agent enroll token',
      description:
        'Creates (or replaces) a pending agent enrollment for a managed deployment and returns a one-time enroll token, shown only once. Ensures the deployment agent signing keypair (Keypair B) exists so the connect step can display the deployment public key.',
    }),
    ApiParam({ name: 'id', description: 'Deployment UUID', example: '550e8400-e29b-41d4-a716-446655440000' }),
    ApiResponse({ status: 201, description: 'Enroll token issued.', type: EnrollTokenDto }),
    ApiResponse({ status: 400, description: 'Not an agent-managed deployment.' }),
    ApiResponse({ status: 401, description: 'Unauthorized.' }),
    ApiResponse({ status: 404, description: 'Deployment not found.' }),
  );
}

export function ApiGetAgentStatus() {
  return applyDecorators(
    ApiOperation({
      summary: 'Get agent status',
      description:
        'Returns the enrolled agent status — reconcile conditions, per-service health, host metrics, DNS delegation, tracked certificates, generation, and version.',
    }),
    ApiParam({ name: 'id', description: 'Deployment UUID', example: '550e8400-e29b-41d4-a716-446655440000' }),
    ApiResponse({ status: 200, description: 'Agent status.', type: AgentStatusDto }),
    ApiResponse({ status: 401, description: 'Unauthorized.' }),
    ApiResponse({ status: 404, description: 'Deployment not found.' }),
  );
}

export function ApiStreamAgent() {
  return applyDecorators(
    ApiOperation({
      summary: 'Stream agent status + connectivity (SSE)',
      description:
        'Server-Sent Events stream for the live cockpit. Emits an `agent-status` event (the live status the agent reports) on the initial connect and on every agent heartbeat/transition, and an `agent-connectivity` event whenever the agent goes online/offline. The activity timeline has its own stream (GET /activity/stream). Replaces polling — authenticated via the admin session cookie (EventSource cannot send Authorization headers).',
    }),
    ApiParam({ name: 'id', description: 'Deployment UUID', example: '550e8400-e29b-41d4-a716-446655440000' }),
    ApiResponse({ status: 200, description: 'SSE stream of agent-status / agent-event messages.' }),
    ApiResponse({ status: 401, description: 'Unauthorized.' }),
  );
}

export function ApiStreamAgentLogs() {
  return applyDecorators(
    ApiOperation({
      summary: 'Stream a container’s live logs (SSE)',
      description:
        'Request-driven Server-Sent Events stream of a container’s logs. `target` is "agent" (the agent’s own container) or a service name (core-server, postgres, nginx, …). The agent tails the container only while at least one browser is watching; each `log-line` event carries { target, stream, ts, line }. Authenticated via the admin session cookie.',
    }),
    ApiParam({ name: 'id', description: 'Deployment UUID', example: '550e8400-e29b-41d4-a716-446655440000' }),
    ApiParam({ name: 'target', description: 'Container key: "agent" or a service name', example: 'core-server' }),
    ApiResponse({ status: 200, description: 'SSE stream of log-line messages.' }),
    ApiResponse({ status: 401, description: 'Unauthorized.' }),
  );
}
