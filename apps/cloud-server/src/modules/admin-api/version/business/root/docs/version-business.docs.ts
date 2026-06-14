import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { SuccessResponseDto } from '@vritti/api-sdk';
import { VersionBusinessDto } from '@/modules/admin-api/business/root/dto/entity/version-business.dto';
import { AssignVersionBusinessDto } from '../dto/request/assign-version-business.dto';
import { VersionBusinessTableResponseDto } from '../dto/response/version-business-table-response.dto';

// Swagger docs for the businesses-in-version data table (server-stored state)
export function ApiFindForTableVersionBusinesses() {
  return applyDecorators(
    ApiOperation({ summary: 'List businesses assigned to a version for the data table (server-stored state)' }),
    ApiParam({ name: 'versionId', description: 'Version UUID', example: '550e8400-e29b-41d4-a716-446655440000' }),
    ApiResponse({ status: 200, description: 'Businesses retrieved successfully.', type: VersionBusinessTableResponseDto }),
    ApiResponse({ status: 401, description: 'Unauthorized.' }),
  );
}

// Swagger docs for listing businesses assigned to a version with app counts
export function ApiListVersionBusinesses() {
  return applyDecorators(
    ApiOperation({ summary: 'List businesses assigned to a version with per-business app counts' }),
    ApiParam({ name: 'versionId', description: 'Version UUID', example: '550e8400-e29b-41d4-a716-446655440000' }),
    ApiResponse({ status: 200, description: 'Businesses retrieved successfully.', type: [VersionBusinessDto] }),
    ApiResponse({ status: 401, description: 'Unauthorized.' }),
  );
}

// Swagger docs for assigning a business to a version
export function ApiAssignVersionBusiness() {
  return applyDecorators(
    ApiOperation({ summary: 'Assign a business to a version' }),
    ApiParam({ name: 'versionId', description: 'Version UUID', example: '550e8400-e29b-41d4-a716-446655440000' }),
    ApiBody({ type: AssignVersionBusinessDto }),
    ApiResponse({ status: 201, description: 'Business assigned successfully.', type: VersionBusinessDto }),
    ApiResponse({ status: 401, description: 'Unauthorized.' }),
    ApiResponse({ status: 404, description: 'Version or business not found.' }),
    ApiResponse({ status: 409, description: 'Business already assigned to this version.' }),
  );
}

// Swagger docs for unassigning a business from a version
export function ApiUnassignVersionBusiness() {
  return applyDecorators(
    ApiOperation({ summary: 'Unassign a business from a version' }),
    ApiParam({ name: 'versionId', description: 'Version UUID', example: '550e8400-e29b-41d4-a716-446655440000' }),
    ApiParam({ name: 'businessId', description: 'Business UUID', example: '550e8400-e29b-41d4-a716-446655440001' }),
    ApiResponse({ status: 200, description: 'Business unassigned successfully.', type: SuccessResponseDto }),
    ApiResponse({ status: 401, description: 'Unauthorized.' }),
    ApiResponse({ status: 404, description: 'Business not assigned to this version.' }),
    ApiResponse({ status: 409, description: 'Business has apps or role templates in this version.' }),
  );
}
