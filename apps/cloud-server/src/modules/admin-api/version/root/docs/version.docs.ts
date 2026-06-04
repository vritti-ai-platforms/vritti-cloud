import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { SuccessResponseDto } from '@vritti/api-sdk';
import { VersionDto } from '../dto/entity/version.dto';
import { CreateVersionDto } from '../dto/request/create-version.dto';
import { PushArtifactsDto } from '../dto/request/push-artifacts.dto';
import { VersionSelectResponseDto } from '../dto/response/version-select-response.dto';
import { VersionTableResponseDto } from '../dto/response/version-table-response.dto';

// Swagger docs for creating a version
export function ApiCreateVersion() {
  return applyDecorators(
    ApiOperation({ summary: 'Create a new version (ALPHA)' }),
    ApiBody({ type: CreateVersionDto }),
    ApiResponse({ status: 201, description: 'Version created successfully.', type: VersionDto }),
    ApiResponse({ status: 400, description: 'Validation failed.' }),
    ApiResponse({ status: 401, description: 'Unauthorized.' }),
    ApiResponse({ status: 409, description: 'Version string already exists.' }),
  );
}

// Swagger docs for listing versions in a data table
export function ApiFindForTableVersions() {
  return applyDecorators(
    ApiOperation({ summary: 'List versions for data table (server-stored state)' }),
    ApiResponse({ status: 200, description: 'Versions retrieved successfully.', type: VersionTableResponseDto }),
    ApiResponse({ status: 401, description: 'Unauthorized.' }),
  );
}

// Swagger docs for fetching version select options
export function ApiGetVersionSelect() {
  return applyDecorators(
    ApiOperation({ summary: 'Get versions for select component' }),
    ApiQuery({ name: 'search', required: false }),
    ApiQuery({ name: 'limit', required: false, type: Number }),
    ApiQuery({ name: 'offset', required: false, type: Number }),
    ApiResponse({
      status: 200,
      description: 'Version options retrieved.',
      type: VersionSelectResponseDto,
    }),
    ApiResponse({ status: 401, description: 'Unauthorized.' }),
  );
}

// Swagger docs for getting a version by ID
export function ApiGetVersionById() {
  return applyDecorators(
    ApiOperation({ summary: 'Get a version by ID' }),
    ApiParam({ name: 'id', description: 'Version UUID', example: '550e8400-e29b-41d4-a716-446655440000' }),
    ApiResponse({ status: 200, description: 'Version retrieved successfully.', type: VersionDto }),
    ApiResponse({ status: 401, description: 'Unauthorized.' }),
    ApiResponse({ status: 404, description: 'Version not found.' }),
  );
}

// Swagger docs for building a snapshot
export function ApiCreateSnapshot() {
  return applyDecorators(
    ApiOperation({ summary: 'Build a snapshot from all versioned tables' }),
    ApiParam({ name: 'id', description: 'Version UUID', example: '550e8400-e29b-41d4-a716-446655440000' }),
    ApiResponse({ status: 200, description: 'Snapshot created successfully.', type: SuccessResponseDto }),
    ApiResponse({ status: 401, description: 'Unauthorized.' }),
    ApiResponse({ status: 404, description: 'Version not found.' }),
  );
}

// Swagger docs for pushing CI artifacts
export function ApiPushArtifacts() {
  return applyDecorators(
    ApiOperation({ summary: 'Push CI artifacts' }),
    ApiParam({ name: 'id', description: 'Version UUID', example: '550e8400-e29b-41d4-a716-446655440000' }),
    ApiBody({ type: PushArtifactsDto }),
    ApiResponse({ status: 200, description: 'Artifacts pushed successfully.', type: SuccessResponseDto }),
    ApiResponse({ status: 401, description: 'Unauthorized.' }),
    ApiResponse({ status: 404, description: 'Version not found.' }),
  );
}

// Swagger docs for deleting a version
export function ApiDeleteVersion() {
  return applyDecorators(
    ApiOperation({ summary: 'Delete a version (PROD versions cannot be deleted)' }),
    ApiParam({ name: 'id', description: 'Version UUID', example: '550e8400-e29b-41d4-a716-446655440000' }),
    ApiResponse({ status: 200, description: 'Version deleted successfully.', type: SuccessResponseDto }),
    ApiResponse({ status: 400, description: 'PROD versions cannot be deleted.' }),
    ApiResponse({ status: 401, description: 'Unauthorized.' }),
    ApiResponse({ status: 404, description: 'Version not found.' }),
  );
}
