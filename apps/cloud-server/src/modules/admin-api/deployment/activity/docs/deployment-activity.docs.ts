import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { DeploymentEventsResponseDto } from '../dto/response/deployment-events-response.dto';

export function ApiGetActivity() {
  return applyDecorators(
    ApiOperation({
      summary: 'Get the deployment activity timeline',
      description:
        'Returns a newest-first, cursor-paginated page of the deployment activity timeline (reconcile transitions, cert issuance, backups, errors). Pass the returned nextCursor to fetch the next (older) page.',
    }),
    ApiParam({ name: 'id', description: 'Deployment UUID', example: '550e8400-e29b-41d4-a716-446655440000' }),
    ApiQuery({ name: 'cursor', required: false, description: 'Opaque cursor from a previous page' }),
    ApiResponse({ status: 200, description: 'Activity timeline page.', type: DeploymentEventsResponseDto }),
    ApiResponse({ status: 401, description: 'Unauthorized.' }),
    ApiResponse({ status: 404, description: 'Deployment not found.' }),
  );
}

export function ApiStreamActivity() {
  return applyDecorators(
    ApiOperation({
      summary: 'Stream the deployment activity timeline (SSE)',
      description:
        'Server-Sent Events stream for the live activity timeline. Emits an `activity-event` (one timeline entry) whenever a new event is appended. The browser seeds history via the GET endpoint and keeps this open for live additions — no polling. Authenticated via the admin session cookie (EventSource cannot send Authorization headers).',
    }),
    ApiParam({ name: 'id', description: 'Deployment UUID', example: '550e8400-e29b-41d4-a716-446655440000' }),
    ApiResponse({ status: 200, description: 'SSE stream of activity-event messages.' }),
    ApiResponse({ status: 401, description: 'Unauthorized.' }),
  );
}
