import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { SuccessResponseDto } from '@vritti/api-sdk';
import { AssignFeaturesDto } from '../dto/request/assign-features.dto';
import { AppFeatureTableResponseDto } from '../dto/response/app-feature-table-response.dto';

// Swagger docs for listing app features in a data table
export function ApiFindForTableAppFeatures() {
  return applyDecorators(
    ApiOperation({ summary: 'List app features for data table (server-stored state)' }),
    ApiParam({ name: 'appId', description: 'App UUID', example: '550e8400-e29b-41d4-a716-446655440000' }),
    ApiResponse({ status: 200, description: 'App features retrieved successfully.', type: AppFeatureTableResponseDto }),
    ApiResponse({ status: 401, description: 'Unauthorized.' }),
    ApiResponse({ status: 404, description: 'App not found.' }),
  );
}

// Swagger docs for listing features assigned to an app
export function ApiListAppFeatures() {
  return applyDecorators(
    ApiOperation({ summary: 'List features assigned to an app' }),
    ApiParam({ name: 'appId', description: 'App UUID', example: '550e8400-e29b-41d4-a716-446655440000' }),
    ApiResponse({ status: 200, description: 'Features retrieved successfully.' }),
    ApiResponse({ status: 401, description: 'Unauthorized.' }),
    ApiResponse({ status: 404, description: 'App not found.' }),
  );
}

// Swagger docs for assigning features to an app
export function ApiAssignFeatures() {
  return applyDecorators(
    ApiOperation({ summary: 'Assign features to an app (bulk upsert)' }),
    ApiParam({ name: 'appId', description: 'App UUID', example: '550e8400-e29b-41d4-a716-446655440000' }),
    ApiBody({ type: AssignFeaturesDto }),
    ApiResponse({ status: 201, description: 'Features assigned successfully.', type: SuccessResponseDto }),
    ApiResponse({ status: 400, description: 'Validation failed.' }),
    ApiResponse({ status: 401, description: 'Unauthorized.' }),
    ApiResponse({ status: 404, description: 'App or features not found.' }),
  );
}

// Swagger docs for removing a feature from an app
export function ApiRemoveAppFeature() {
  return applyDecorators(
    ApiOperation({ summary: 'Remove a feature from an app' }),
    ApiParam({ name: 'appId', description: 'App UUID', example: '550e8400-e29b-41d4-a716-446655440000' }),
    ApiParam({ name: 'featureId', description: 'Feature UUID', example: '550e8400-e29b-41d4-a716-446655440000' }),
    ApiResponse({ status: 200, description: 'Feature removed from app successfully.', type: SuccessResponseDto }),
    ApiResponse({ status: 401, description: 'Unauthorized.' }),
    ApiResponse({ status: 404, description: 'App or feature assignment not found.' }),
    ApiResponse({ status: 409, description: 'Feature is referenced by roles.' }),
  );
}
