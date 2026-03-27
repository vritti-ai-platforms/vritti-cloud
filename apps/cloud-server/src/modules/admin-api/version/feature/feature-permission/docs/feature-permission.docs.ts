import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { SuccessResponseDto } from '@vritti/api-sdk';
import { SetFeaturePermissionsDto } from '../dto/request/set-feature-permissions.dto';
import { FeaturePermissionTypesResponseDto } from '../dto/response/feature-permission-types-response.dto';

// Swagger docs for getting feature permission types
export function ApiGetFeaturePermissions() {
  return applyDecorators(
    ApiOperation({ summary: 'Get permission types for a feature' }),
    ApiParam({ name: 'featureId', description: 'Feature UUID', example: '550e8400-e29b-41d4-a716-446655440000' }),
    ApiResponse({ status: 200, description: 'Permission types retrieved successfully.', type: FeaturePermissionTypesResponseDto }),
    ApiResponse({ status: 401, description: 'Unauthorized.' }),
    ApiResponse({ status: 404, description: 'Feature not found.' }),
  );
}

// Swagger docs for setting feature permission types
export function ApiSetFeaturePermissions() {
  return applyDecorators(
    ApiOperation({ summary: 'Set permission types for a feature (full replace)' }),
    ApiParam({ name: 'featureId', description: 'Feature UUID', example: '550e8400-e29b-41d4-a716-446655440000' }),
    ApiBody({ type: SetFeaturePermissionsDto }),
    ApiResponse({ status: 200, description: 'Feature permissions updated successfully.', type: SuccessResponseDto }),
    ApiResponse({ status: 400, description: 'Validation failed.' }),
    ApiResponse({ status: 401, description: 'Unauthorized.' }),
    ApiResponse({ status: 404, description: 'Feature not found.' }),
  );
}
