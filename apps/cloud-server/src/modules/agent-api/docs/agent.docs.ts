import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiHeader, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { SuccessResponseDto } from '@vritti/api-sdk/database';
import { EnrollRequestDto } from '../dto/request/enroll-request.dto';
import { StatusReportDto } from '../dto/request/status-report.dto';
import { EnrollResponseDto } from '../dto/response/enroll-response.dto';
import { SignedDesiredStateDto } from '../dto/response/signed-desired-state.dto';

export function ApiAgentEnroll() {
  return applyDecorators(
    ApiOperation({
      summary: 'Enroll an agent',
      description:
        'One-time enrollment. Authenticated by the enroll token plus a trust-on-first-use Ed25519 signature over the raw request body (verified against signingPubKey in the body). Returns the long-lived agent credential, the deployment public key (Keypair B), and a signed connectivity nonce.',
    }),
    ApiHeader({ name: 'X-Vritti-Agent-Key', description: 'Agent Ed25519 public key (base64 raw 32-byte)' }),
    ApiHeader({ name: 'X-Vritti-Signature', description: 'Ed25519 signature over the raw request body (base64)' }),
    ApiBody({ type: EnrollRequestDto }),
    ApiResponse({ status: 200, description: 'Agent enrolled successfully.', type: EnrollResponseDto }),
    ApiResponse({ status: 401, description: 'Invalid token or signature.' }),
    ApiResponse({ status: 404, description: 'Deployment not found.' }),
  );
}

export function ApiGetDesiredState() {
  return applyDecorators(
    ApiOperation({
      summary: 'Get signed desired-state',
      description:
        'Returns the signed desired-state the agent reconciles toward. Authenticated by the agent bearer credential plus an Ed25519 signature over the (empty) raw body. The generation bumps only when the built payload changes.',
    }),
    ApiParam({ name: 'id', description: 'Deployment UUID', example: '550e8400-e29b-41d4-a716-446655440000' }),
    ApiHeader({ name: 'Authorization', description: 'Bearer <agentCredential>' }),
    ApiHeader({ name: 'X-Vritti-Agent-Key', description: 'Agent Ed25519 public key (base64 raw 32-byte)' }),
    ApiHeader({ name: 'X-Vritti-Signature', description: 'Ed25519 signature over the raw body (base64)' }),
    ApiResponse({ status: 200, description: 'Signed desired-state.', type: SignedDesiredStateDto }),
    ApiResponse({ status: 401, description: 'Unauthenticated agent request.' }),
    ApiResponse({ status: 404, description: 'Deployment not found.' }),
  );
}

export function ApiAgentStatus() {
  return applyDecorators(
    ApiOperation({
      summary: 'Report agent status',
      description:
        'Records an agent heartbeat (phase, applied generation, container states, Gitea provisioning). Authenticated like the desired-state endpoint.',
    }),
    ApiParam({ name: 'id', description: 'Deployment UUID', example: '550e8400-e29b-41d4-a716-446655440000' }),
    ApiHeader({ name: 'Authorization', description: 'Bearer <agentCredential>' }),
    ApiHeader({ name: 'X-Vritti-Agent-Key', description: 'Agent Ed25519 public key (base64 raw 32-byte)' }),
    ApiHeader({ name: 'X-Vritti-Signature', description: 'Ed25519 signature over the raw body (base64)' }),
    ApiBody({ type: StatusReportDto }),
    ApiResponse({ status: 200, description: 'Status recorded.', type: SuccessResponseDto }),
    ApiResponse({ status: 401, description: 'Unauthenticated agent request.' }),
  );
}
