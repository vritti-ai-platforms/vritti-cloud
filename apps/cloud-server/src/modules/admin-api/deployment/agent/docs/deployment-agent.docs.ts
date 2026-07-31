import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { AgentStatusDto } from '../dto/entity/agent-status.dto';
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
      description: 'Returns the enrolled agent status (phase, heartbeat, generation, version, gitea provisioning).',
    }),
    ApiParam({ name: 'id', description: 'Deployment UUID', example: '550e8400-e29b-41d4-a716-446655440000' }),
    ApiResponse({ status: 200, description: 'Agent status.', type: AgentStatusDto }),
    ApiResponse({ status: 401, description: 'Unauthorized.' }),
    ApiResponse({ status: 404, description: 'Deployment not found.' }),
  );
}
