import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { AgentStatusDto } from '../dto/entity/agent-status.dto';
import { DeploymentEventsResponseDto } from '../dto/response/deployment-events-response.dto';
import { EnrollTokenDto } from '../dto/response/enroll-token.dto';

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
      summary: 'Stream agent status + timeline (SSE)',
      description:
        'Server-Sent Events stream for the live cockpit. Emits an `agent-status` event (full agent status) on the initial connect and on every agent heartbeat/transition, and an `agent-event` event (one timeline entry) whenever a new event is appended. Replaces polling — authenticated via the admin session cookie (EventSource cannot send Authorization headers).',
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
    ApiQuery({
      name: 'target',
      required: false,
      description: 'Container key: "agent" or a service name',
      example: 'core-server',
    }),
    ApiResponse({ status: 200, description: 'SSE stream of log-line messages.' }),
    ApiResponse({ status: 401, description: 'Unauthorized.' }),
  );
}

export function ApiGetAgentEvents() {
  return applyDecorators(
    ApiOperation({
      summary: 'Get the deployment event timeline',
      description:
        'Returns a newest-first, cursor-paginated page of the deployment event timeline (reconcile transitions, cert issuance, backups, errors). Pass the returned nextCursor to fetch the next (older) page.',
    }),
    ApiParam({ name: 'id', description: 'Deployment UUID', example: '550e8400-e29b-41d4-a716-446655440000' }),
    ApiQuery({ name: 'cursor', required: false, description: 'Opaque cursor from a previous page' }),
    ApiResponse({ status: 200, description: 'Event timeline page.', type: DeploymentEventsResponseDto }),
    ApiResponse({ status: 401, description: 'Unauthorized.' }),
    ApiResponse({ status: 404, description: 'Deployment not found.' }),
  );
}
