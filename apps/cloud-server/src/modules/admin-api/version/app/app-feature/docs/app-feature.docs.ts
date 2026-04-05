import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { SuccessResponseDto } from '@vritti/api-sdk';
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

// Swagger docs for assigning a feature to an app
export function ApiAssignFeature() {
  return applyDecorators(
    ApiOperation({ summary: 'Assign a feature to an app' }),
    ApiParam({ name: 'appId', description: 'App UUID', example: '550e8400-e29b-41d4-a716-446655440000' }),
    ApiParam({ name: 'featureId', description: 'Feature UUID', example: '550e8400-e29b-41d4-a716-446655440000' }),
    ApiResponse({ status: 201, description: 'Feature assigned successfully.', type: SuccessResponseDto }),
    ApiResponse({ status: 400, description: 'Feature has no permissions defined.' }),
    ApiResponse({ status: 401, description: 'Unauthorized.' }),
    ApiResponse({ status: 404, description: 'App or feature not found.' }),
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
