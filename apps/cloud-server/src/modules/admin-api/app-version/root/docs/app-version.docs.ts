import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { SuccessResponseDto } from '@vritti/api-sdk';
import { AppVersionDto } from '../dto/entity/app-version.dto';
import { CreateAppVersionDto } from '../dto/request/create-app-version.dto';
import { PushArtifactsDto } from '../dto/request/push-artifacts.dto';
import { AppVersionSelectResponseDto } from '../dto/response/app-version-select-response.dto';
import { AppVersionTableResponseDto } from '../dto/response/app-version-table-response.dto';

// Swagger docs for creating an app version
export function ApiCreateAppVersion() {
  return applyDecorators(
    ApiOperation({ summary: 'Create a new app version (DRAFT)' }),
    ApiBody({ type: CreateAppVersionDto }),
    ApiResponse({ status: 201, description: 'App version created successfully.', type: AppVersionDto }),
    ApiResponse({ status: 400, description: 'Validation failed.' }),
    ApiResponse({ status: 401, description: 'Unauthorized.' }),
    ApiResponse({ status: 409, description: 'Version string already exists.' }),
  );
}

// Swagger docs for listing app versions in a data table
export function ApiFindForTableAppVersions() {
  return applyDecorators(
    ApiOperation({ summary: 'List app versions for data table (server-stored state)' }),
    ApiResponse({ status: 200, description: 'App versions retrieved successfully.', type: AppVersionTableResponseDto }),
    ApiResponse({ status: 401, description: 'Unauthorized.' }),
  );
}

// Swagger docs for fetching app version select options
export function ApiGetAppVersionSelect() {
  return applyDecorators(
    ApiOperation({ summary: 'Get app versions for select component' }),
    ApiQuery({ name: 'search', required: false }),
    ApiQuery({ name: 'limit', required: false, type: Number }),
    ApiQuery({ name: 'offset', required: false, type: Number }),
    ApiResponse({
      status: 200,
      description: 'App version options retrieved.',
      type: AppVersionSelectResponseDto,
    }),
    ApiResponse({ status: 401, description: 'Unauthorized.' }),
  );
}

// Swagger docs for getting an app version by ID
export function ApiGetAppVersionById() {
  return applyDecorators(
    ApiOperation({ summary: 'Get an app version by ID' }),
    ApiParam({ name: 'id', description: 'App version UUID', example: '550e8400-e29b-41d4-a716-446655440000' }),
    ApiResponse({ status: 200, description: 'App version retrieved successfully.', type: AppVersionDto }),
    ApiResponse({ status: 401, description: 'Unauthorized.' }),
    ApiResponse({ status: 404, description: 'App version not found.' }),
  );
}

// Swagger docs for finalizing an app version
export function ApiFinalizeAppVersion() {
  return applyDecorators(
    ApiOperation({ summary: 'Finalize a DRAFT version (build snapshot)' }),
    ApiParam({ name: 'id', description: 'App version UUID', example: '550e8400-e29b-41d4-a716-446655440000' }),
    ApiResponse({ status: 200, description: 'App version finalized successfully.', type: SuccessResponseDto }),
    ApiResponse({ status: 400, description: 'Version is not in DRAFT status.' }),
    ApiResponse({ status: 401, description: 'Unauthorized.' }),
    ApiResponse({ status: 404, description: 'App version not found.' }),
  );
}

// Swagger docs for pushing CI artifacts to a finalized version
export function ApiPushArtifacts() {
  return applyDecorators(
    ApiOperation({ summary: 'Push CI artifacts (transitions to READY)' }),
    ApiParam({ name: 'id', description: 'App version UUID', example: '550e8400-e29b-41d4-a716-446655440000' }),
    ApiBody({ type: PushArtifactsDto }),
    ApiResponse({ status: 200, description: 'Artifacts pushed and version marked as READY.', type: SuccessResponseDto }),
    ApiResponse({ status: 400, description: 'Version must be finalized first.' }),
    ApiResponse({ status: 401, description: 'Unauthorized.' }),
    ApiResponse({ status: 404, description: 'App version not found.' }),
  );
}

// Swagger docs for deleting a DRAFT app version
export function ApiDeleteAppVersion() {
  return applyDecorators(
    ApiOperation({ summary: 'Delete a DRAFT app version' }),
    ApiParam({ name: 'id', description: 'App version UUID', example: '550e8400-e29b-41d4-a716-446655440000' }),
    ApiResponse({ status: 200, description: 'App version deleted successfully.', type: SuccessResponseDto }),
    ApiResponse({ status: 400, description: 'Only DRAFT versions can be deleted.' }),
    ApiResponse({ status: 401, description: 'Unauthorized.' }),
    ApiResponse({ status: 404, description: 'App version not found.' }),
  );
}
