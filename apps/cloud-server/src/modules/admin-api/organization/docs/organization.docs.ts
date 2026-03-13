import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { OrganizationDetailDto } from '../dto/entity/organization-detail.dto';
import { OrganizationTableResponseDto } from '../dto/response/organizations-response.dto';

export function ApiFindForTableOrganizations() {
  return applyDecorators(
    ApiOperation({ summary: 'List organizations for data table (server-stored state)' }),
    ApiResponse({ status: 200, description: 'Organizations retrieved successfully.', type: OrganizationTableResponseDto }),
    ApiResponse({ status: 401, description: 'Unauthorized.' }),
  );
}

export function ApiFindOrganizationById() {
  return applyDecorators(
    ApiOperation({ summary: 'Get an organization by ID' }),
    ApiParam({ name: 'id', description: 'Organization UUID', example: '550e8400-e29b-41d4-a716-446655440000' }),
    ApiResponse({ status: 200, description: 'Organization retrieved successfully.', type: OrganizationDetailDto }),
    ApiResponse({ status: 401, description: 'Unauthorized.' }),
    ApiResponse({ status: 404, description: 'Organization not found.' }),
  );
}
