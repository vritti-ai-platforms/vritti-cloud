import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { SuccessResponseDto } from '@vritti/api-sdk';
import { SessionResponse } from '../../../cloud-api/auth/root/dto/entity/session-response.dto';
import { ChangePasswordDto } from '../dto/request/change-password.dto';

export function ApiChangePassword() {
  return applyDecorators(
    ApiOperation({
      summary: 'Change password',
      description: "Change the authenticated user's password. Requires current password verification.",
    }),
    ApiBody({ type: ChangePasswordDto }),
    ApiResponse({ status: 200, description: 'Password changed successfully.', type: SuccessResponseDto }),
    ApiResponse({ status: 400, description: 'Invalid current password or new password matches current.' }),
    ApiResponse({ status: 401, description: 'Unauthorized.' }),
  );
}

export function ApiGetSessions() {
  return applyDecorators(
    ApiOperation({
      summary: 'List active sessions',
      description: 'Get all active sessions for the authenticated user across all devices.',
    }),
    ApiResponse({ status: 200, description: 'Active sessions retrieved.', type: [SessionResponse] }),
    ApiResponse({ status: 401, description: 'Unauthorized.' }),
  );
}

export function ApiRevokeSession() {
  return applyDecorators(
    ApiOperation({
      summary: 'Revoke a specific session',
      description: 'Invalidate a specific session by ID. Cannot revoke the current session.',
    }),
    ApiParam({ name: 'id', description: 'Session ID to revoke' }),
    ApiResponse({ status: 200, description: 'Session revoked.', type: SuccessResponseDto }),
    ApiResponse({ status: 400, description: 'Cannot revoke current session.' }),
    ApiResponse({ status: 401, description: 'Unauthorized.' }),
    ApiResponse({ status: 404, description: 'Session not found.' }),
  );
}

export function ApiRevokeAllSessions() {
  return applyDecorators(
    ApiOperation({
      summary: 'Revoke all other sessions',
      description: 'Invalidate all active sessions for the current user except the current one.',
    }),
    ApiResponse({ status: 200, description: 'All other sessions revoked.', type: SuccessResponseDto }),
    ApiResponse({ status: 401, description: 'Unauthorized.' }),
  );
}