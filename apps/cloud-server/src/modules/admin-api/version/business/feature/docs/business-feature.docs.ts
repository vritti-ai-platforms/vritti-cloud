import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { SuccessResponseDto } from '@vritti/api-sdk';
import { BusinessFeaturePermissionDto } from '../dto/entity/business-feature-permission.dto';
import { SetFeatureAppDto } from '../dto/request/set-feature-app.dto';
import { BusinessFeatureTableResponseDto } from '../dto/response/business-feature-table-response.dto';

// Swagger docs for listing a business's features (with permissions and apps) in a data table
export function ApiFindForTableBusinessFeatures() {
  return applyDecorators(
    ApiOperation({
      summary: 'List features visible to a business (each grouped with its permissions and apps), with table state',
    }),
    ApiParam({ name: 'versionId', description: 'Version UUID', example: '550e8400-e29b-41d4-a716-446655440000' }),
    ApiParam({ name: 'businessId', description: 'Business UUID', example: '550e8400-e29b-41d4-a716-446655440001' }),
    ApiResponse({
      status: 200,
      description: 'Features retrieved successfully.',
      type: BusinessFeatureTableResponseDto,
    }),
    ApiResponse({ status: 401, description: 'Unauthorized.' }),
  );
}

// Swagger docs for listing a feature's permissions that apply to a business
export function ApiFindBusinessFeaturePermissions() {
  return applyDecorators(
    ApiOperation({ summary: 'List a feature’s permissions that apply to a business (global or business-linked)' }),
    ApiParam({ name: 'versionId', description: 'Version UUID', example: '550e8400-e29b-41d4-a716-446655440000' }),
    ApiParam({ name: 'businessId', description: 'Business UUID', example: '550e8400-e29b-41d4-a716-446655440001' }),
    ApiParam({ name: 'featureId', description: 'Feature UUID', example: '550e8400-e29b-41d4-a716-446655440002' }),
    ApiResponse({
      status: 200,
      description: 'Permissions retrieved successfully.',
      type: [BusinessFeaturePermissionDto],
    }),
    ApiResponse({ status: 401, description: 'Unauthorized.' }),
    ApiResponse({ status: 404, description: 'Feature not found.' }),
  );
}

// Swagger docs for pinning a feature to a single app within a business
export function ApiSetFeatureApp() {
  return applyDecorators(
    ApiOperation({ summary: "Set a feature's app within a business (null removes it from the business)" }),
    ApiParam({ name: 'versionId', description: 'Version UUID', example: '550e8400-e29b-41d4-a716-446655440000' }),
    ApiParam({ name: 'businessId', description: 'Business UUID', example: '550e8400-e29b-41d4-a716-446655440001' }),
    ApiParam({ name: 'featureId', description: 'Feature UUID', example: '550e8400-e29b-41d4-a716-446655440002' }),
    ApiBody({ type: SetFeatureAppDto }),
    ApiResponse({ status: 200, description: 'App updated successfully.', type: SuccessResponseDto }),
    ApiResponse({ status: 400, description: 'Validation failed or invalid app.' }),
    ApiResponse({ status: 401, description: 'Unauthorized.' }),
    ApiResponse({ status: 404, description: 'Feature not found.' }),
  );
}
