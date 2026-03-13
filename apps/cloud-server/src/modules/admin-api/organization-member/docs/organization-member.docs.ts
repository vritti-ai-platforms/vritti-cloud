import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { OrganizationMemberTableResponseDto } from '../dto/response/organization-members-response.dto';

export function ApiFindOrganizationMembers() {
  return applyDecorators(
    ApiOperation({ summary: 'List organization members for data table (server-stored state)' }),
    ApiParam({ name: 'id', description: 'Organization UUID', example: '550e8400-e29b-41d4-a716-446655440000' }),
    ApiResponse({ status: 200, description: 'Organization members retrieved successfully.', type: OrganizationMemberTableResponseDto }),
    ApiResponse({ status: 401, description: 'Unauthorized.' }),
  );
}
