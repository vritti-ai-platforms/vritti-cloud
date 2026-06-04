import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { SuccessResponseDto } from '@vritti/api-sdk';
import { MicrofrontendDto } from '../dto/entity/microfrontend.dto';
import { CreateMicrofrontendDto } from '../dto/request/create-microfrontend.dto';
import { UpdateMicrofrontendDto } from '../dto/request/update-microfrontend.dto';
import { MicrofrontendSelectResponseDto } from '../dto/response/microfrontend-select-response.dto';
import { MicrofrontendTableResponseDto } from '../dto/response/microfrontend-table-response.dto';

// Swagger docs for creating a microfrontend
export function ApiCreateMicrofrontend() {
  return applyDecorators(
    ApiOperation({ summary: 'Create a new microfrontend' }),
    ApiParam({ name: 'versionId', description: 'App version UUID', example: '550e8400-e29b-41d4-a716-446655440000' }),
    ApiBody({ type: CreateMicrofrontendDto }),
    ApiResponse({ status: 201, description: 'Microfrontend created successfully.', type: MicrofrontendDto }),
    ApiResponse({ status: 400, description: 'Validation failed.' }),
    ApiResponse({ status: 401, description: 'Unauthorized.' }),
    ApiResponse({ status: 409, description: 'Microfrontend with this code and platform already exists.' }),
  );
}

// Swagger docs for listing microfrontends in a data table
export function ApiFindForTableMicrofrontends() {
  return applyDecorators(
    ApiOperation({ summary: 'List microfrontends for data table (server-stored state)' }),
    ApiParam({ name: 'versionId', description: 'App version UUID', example: '550e8400-e29b-41d4-a716-446655440000' }),
    ApiResponse({ status: 200, description: 'Microfrontends retrieved successfully.', type: MicrofrontendTableResponseDto }),
    ApiResponse({ status: 401, description: 'Unauthorized.' }),
  );
}

// Swagger docs for fetching microfrontend select options
export function ApiFindMicrofrontendsSelect() {
  return applyDecorators(
    ApiOperation({ summary: 'Get microfrontends for select component' }),
    ApiParam({ name: 'versionId', description: 'App version UUID', example: '550e8400-e29b-41d4-a716-446655440000' }),
    ApiQuery({ name: 'search', required: false }),
    ApiResponse({ status: 200, description: 'Microfrontend options retrieved.', type: MicrofrontendSelectResponseDto }),
    ApiResponse({ status: 401, description: 'Unauthorized.' }),
  );
}

// Swagger docs for getting a microfrontend by ID
export function ApiGetMicrofrontendById() {
  return applyDecorators(
    ApiOperation({ summary: 'Get a microfrontend by ID' }),
    ApiParam({ name: 'versionId', description: 'App version UUID', example: '550e8400-e29b-41d4-a716-446655440000' }),
    ApiParam({ name: 'id', description: 'Microfrontend UUID', example: '550e8400-e29b-41d4-a716-446655440000' }),
    ApiResponse({ status: 200, description: 'Microfrontend retrieved successfully.', type: MicrofrontendDto }),
    ApiResponse({ status: 401, description: 'Unauthorized.' }),
    ApiResponse({ status: 404, description: 'Microfrontend not found.' }),
  );
}

// Swagger docs for updating a microfrontend
export function ApiUpdateMicrofrontend() {
  return applyDecorators(
    ApiOperation({ summary: 'Update a microfrontend' }),
    ApiParam({ name: 'versionId', description: 'App version UUID', example: '550e8400-e29b-41d4-a716-446655440000' }),
    ApiParam({ name: 'id', description: 'Microfrontend UUID', example: '550e8400-e29b-41d4-a716-446655440000' }),
    ApiBody({ type: UpdateMicrofrontendDto }),
    ApiResponse({ status: 200, description: 'Microfrontend updated successfully.', type: SuccessResponseDto }),
    ApiResponse({ status: 400, description: 'Validation failed.' }),
    ApiResponse({ status: 401, description: 'Unauthorized.' }),
    ApiResponse({ status: 404, description: 'Microfrontend not found.' }),
    ApiResponse({ status: 409, description: 'Microfrontend with this code and platform already exists.' }),
  );
}

// Swagger docs for deleting a microfrontend
export function ApiDeleteMicrofrontend() {
  return applyDecorators(
    ApiOperation({ summary: 'Delete a microfrontend' }),
    ApiParam({ name: 'versionId', description: 'App version UUID', example: '550e8400-e29b-41d4-a716-446655440000' }),
    ApiParam({ name: 'id', description: 'Microfrontend UUID', example: '550e8400-e29b-41d4-a716-446655440000' }),
    ApiResponse({ status: 200, description: 'Microfrontend deleted successfully.', type: SuccessResponseDto }),
    ApiResponse({ status: 401, description: 'Unauthorized.' }),
    ApiResponse({ status: 404, description: 'Microfrontend not found.' }),
    ApiResponse({ status: 409, description: 'Microfrontend is referenced by features.' }),
  );
}
