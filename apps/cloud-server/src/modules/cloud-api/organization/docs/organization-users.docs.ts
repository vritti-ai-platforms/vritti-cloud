import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { SuccessResponseDto } from '@vritti/api-sdk';
import { InviteUserDto } from '../dto/request/invite-user.dto';
import { UpdateOrgUserDto } from '../dto/request/update-org-user.dto';
import { NexusUserResponseDto } from '../dto/response/nexus-user-response.dto';
import { UsersTableResponseDto } from '../dto/response/users-table-response.dto';

export function ApiGetOrgUsersTable() {
  return applyDecorators(
    ApiOperation({ summary: 'List organization users for data table (server-stored state)' }),
    ApiResponse({ status: 200, description: 'Users retrieved successfully.', type: UsersTableResponseDto }),
    ApiResponse({ status: 401, description: 'Unauthorized.' }),
    ApiResponse({ status: 404, description: 'Organization or deployment not found.' }),
  );
}

export function ApiGetOrgUsers() {
  return applyDecorators(
    ApiOperation({
      summary: 'List organization users',
      description: 'Returns all nexus portal users for the specified organization.',
    }),
    ApiResponse({ status: 200, description: 'List of organization users.', type: [NexusUserResponseDto] }),
    ApiResponse({ status: 404, description: 'Organization or deployment not found.' }),
  );
}

export function ApiInviteUser() {
  return applyDecorators(
    ApiOperation({
      summary: 'Invite a user to the organization',
      description: 'Invites a user to the organization in the nexus portal.',
    }),
    ApiBody({ type: InviteUserDto }),
    ApiResponse({ status: 201, description: 'User invited successfully.', type: SuccessResponseDto }),
    ApiResponse({ status: 400, description: 'Validation failed.' }),
    ApiResponse({ status: 404, description: 'Organization or deployment not found.' }),
  );
}

export function ApiUpdateOrgUser() {
  return applyDecorators(
    ApiOperation({
      summary: 'Update a user',
      description: 'Updates a portal user\'s email or name in the nexus deployment.',
    }),
    ApiBody({ type: UpdateOrgUserDto }),
    ApiResponse({ status: 200, description: 'User updated successfully.', type: SuccessResponseDto }),
    ApiResponse({ status: 400, description: 'Validation failed.' }),
    ApiResponse({ status: 409, description: 'Email already in use.' }),
  );
}

export function ApiResendInvite() {
  return applyDecorators(
    ApiOperation({
      summary: 'Resend invitation email',
      description: 'Resends the invitation email to a PENDING user, generating a fresh token.',
    }),
    ApiResponse({ status: 200, description: 'Invitation resent successfully.', type: SuccessResponseDto }),
    ApiResponse({ status: 400, description: 'User is not in PENDING status.' }),
    ApiResponse({ status: 404, description: 'Organization, deployment, or user not found.' }),
  );
}
