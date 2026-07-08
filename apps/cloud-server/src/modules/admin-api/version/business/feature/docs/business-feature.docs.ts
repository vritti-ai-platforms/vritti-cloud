import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { SuccessResponseDto } from '@vritti/api-sdk/database';
import { BusinessFeaturePermissionDto } from '../dto/entity/business-feature-permission.dto';
import { AssignFeaturesToAppDto } from '../dto/request/assign-features-to-app.dto';
import { RemoveBusinessFeaturesDto } from '../dto/request/remove-business-features.dto';
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

export function ApiAssignFeaturesToApp() {
  return applyDecorators(
    ApiOperation({ summary: 'Add many features to a business at once, all pinned to one app' }),
    ApiParam({ name: 'versionId', description: 'Version UUID', example: '550e8400-e29b-41d4-a716-446655440000' }),
    ApiParam({ name: 'businessId', description: 'Business UUID', example: '550e8400-e29b-41d4-a716-446655440001' }),
    ApiBody({ type: AssignFeaturesToAppDto }),
    ApiResponse({ status: 201, description: 'Features added to the business.', type: SuccessResponseDto }),
    ApiResponse({ status: 400, description: 'Invalid app, or a feature has no permissions / wrong version.' }),
    ApiResponse({ status: 401, description: 'Unauthorized.' }),
  );
}

export function ApiRemoveBusinessFeatures() {
  return applyDecorators(
    ApiOperation({ summary: 'Remove many features from a business at once (unassigns each from its app)' }),
    ApiParam({ name: 'versionId', description: 'Version UUID', example: '550e8400-e29b-41d4-a716-446655440000' }),
    ApiParam({ name: 'businessId', description: 'Business UUID', example: '550e8400-e29b-41d4-a716-446655440001' }),
    ApiBody({ type: RemoveBusinessFeaturesDto }),
    ApiResponse({ status: 200, description: 'Features removed from the business.', type: SuccessResponseDto }),
    ApiResponse({ status: 400, description: 'Validation failed.' }),
    ApiResponse({ status: 401, description: 'Unauthorized.' }),
  );
}
