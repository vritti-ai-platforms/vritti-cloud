import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { SuccessResponseDto } from '@vritti/api-sdk';
import { FeatureDto } from '../dto/entity/feature.dto';
import { BulkCreateFeaturesDto } from '../dto/request/bulk-create-features.dto';
import { CreateFeatureDto } from '../dto/request/create-feature.dto';
import { UpdateFeatureDto } from '../dto/request/update-feature.dto';
import { FeatureSelectResponseDto } from '../dto/response/feature-select-response.dto';
import { FeatureTableResponseDto } from '../dto/response/feature-table-response.dto';
import { FeatureWithPermissionsResponseDto } from '../dto/response/feature-with-permissions-response.dto';

// Swagger docs for creating a feature
export function ApiCreateFeature() {
  return applyDecorators(
    ApiOperation({ summary: 'Create a new feature' }),
    ApiBody({ type: CreateFeatureDto }),
    ApiResponse({ status: 201, description: 'Feature created successfully.', type: FeatureDto }),
    ApiResponse({ status: 400, description: 'Validation failed.' }),
    ApiResponse({ status: 401, description: 'Unauthorized.' }),
    ApiResponse({ status: 409, description: 'Feature with this code already exists.' }),
  );
}

// Swagger docs for listing features in a data table
export function ApiFindForTableFeatures() {
  return applyDecorators(
    ApiOperation({ summary: 'List features for data table (server-stored state)' }),
    ApiResponse({ status: 200, description: 'Features retrieved successfully.', type: FeatureTableResponseDto }),
    ApiResponse({ status: 401, description: 'Unauthorized.' }),
  );
}

// Swagger docs for fetching feature select options
export function ApiFindFeaturesSelect() {
  return applyDecorators(
    ApiOperation({ summary: 'Get features for select component' }),
    ApiQuery({ name: 'search', required: false }),
    ApiQuery({ name: 'limit', required: false, type: Number }),
    ApiQuery({ name: 'offset', required: false, type: Number }),
    ApiResponse({
      status: 200,
      description: 'Feature options retrieved.',
      type: FeatureSelectResponseDto,
    }),
    ApiResponse({ status: 401, description: 'Unauthorized.' }),
  );
}

// Swagger docs for getting all features with their permission types and app codes
export function ApiFindFeaturesWithPermissions() {
  return applyDecorators(
    ApiOperation({ summary: 'List features with permission types and app codes for a version' }),
    ApiParam({ name: 'versionId', description: 'App version UUID' }),
    ApiResponse({
      status: 200,
      description: 'Features with permissions retrieved successfully.',
      type: [FeatureWithPermissionsResponseDto],
    }),
    ApiResponse({ status: 401, description: 'Unauthorized.' }),
  );
}

// Swagger docs for getting a feature by ID
export function ApiGetFeatureById() {
  return applyDecorators(
    ApiOperation({ summary: 'Get a feature by ID' }),
    ApiParam({ name: 'id', description: 'Feature UUID', example: '550e8400-e29b-41d4-a716-446655440000' }),
    ApiResponse({ status: 200, description: 'Feature retrieved successfully.', type: FeatureDto }),
    ApiResponse({ status: 401, description: 'Unauthorized.' }),
    ApiResponse({ status: 404, description: 'Feature not found.' }),
  );
}

// Swagger docs for updating a feature
export function ApiUpdateFeature() {
  return applyDecorators(
    ApiOperation({ summary: 'Update a feature' }),
    ApiParam({ name: 'id', description: 'Feature UUID', example: '550e8400-e29b-41d4-a716-446655440000' }),
    ApiBody({ type: UpdateFeatureDto }),
    ApiResponse({ status: 200, description: 'Feature updated successfully.', type: SuccessResponseDto }),
    ApiResponse({ status: 400, description: 'Validation failed.' }),
    ApiResponse({ status: 401, description: 'Unauthorized.' }),
    ApiResponse({ status: 404, description: 'Feature not found.' }),
    ApiResponse({ status: 409, description: 'Feature with this code already exists.' }),
  );
}

// Swagger docs for deleting a feature
export function ApiDeleteFeature() {
  return applyDecorators(
    ApiOperation({ summary: 'Delete a feature' }),
    ApiParam({ name: 'id', description: 'Feature UUID', example: '550e8400-e29b-41d4-a716-446655440000' }),
    ApiResponse({ status: 200, description: 'Feature deleted successfully.', type: SuccessResponseDto }),
    ApiResponse({ status: 401, description: 'Unauthorized.' }),
    ApiResponse({ status: 404, description: 'Feature not found.' }),
    ApiResponse({ status: 409, description: 'Feature is referenced by app features.' }),
  );
}

// Swagger docs for bulk-creating features
export function ApiBulkCreateFeatures() {
  return applyDecorators(
    ApiOperation({ summary: 'Bulk create features for seeding' }),
    ApiBody({ type: BulkCreateFeaturesDto }),
    ApiResponse({ status: 201, description: 'Features created (some may have been skipped).' }),
    ApiResponse({ status: 400, description: 'Validation failed.' }),
    ApiResponse({ status: 401, description: 'Unauthorized.' }),
  );
}
