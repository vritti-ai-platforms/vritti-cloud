import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { InviteUserDto } from '../dto/request/invite-user.dto';
import { NexusUserResponseDto } from '../dto/response/nexus-user-response.dto';

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
    ApiResponse({ status: 201, description: 'User invited successfully.', type: NexusUserResponseDto }),
    ApiResponse({ status: 400, description: 'Validation failed.' }),
    ApiResponse({ status: 404, description: 'Organization or deployment not found.' }),
  );
}
