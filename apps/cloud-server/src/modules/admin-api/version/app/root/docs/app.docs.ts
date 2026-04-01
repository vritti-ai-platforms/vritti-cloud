import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiProduces, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { SuccessResponseDto } from '@vritti/api-sdk';
import { AppDto } from '../dto/entity/app.dto';
import { CreateAppDto } from '../dto/request/create-app.dto';
import { UpdateAppDto } from '../dto/request/update-app.dto';
import { AppTableResponseDto } from '../dto/response/app-table-response.dto';

// Swagger docs for creating an app
export function ApiCreateApp() {
  return applyDecorators(
    ApiOperation({ summary: 'Create a new app' }),
    ApiBody({ type: CreateAppDto }),
    ApiResponse({ status: 201, description: 'App created successfully.', type: AppDto }),
    ApiResponse({ status: 400, description: 'Validation failed.' }),
    ApiResponse({ status: 401, description: 'Unauthorized.' }),
    ApiResponse({ status: 409, description: 'App with this code already exists.' }),
  );
}

// Swagger docs for listing apps in a data table
export function ApiFindForTableApps() {
  return applyDecorators(
    ApiOperation({ summary: 'List apps for data table (server-stored state)' }),
    ApiResponse({ status: 200, description: 'Apps retrieved successfully.', type: AppTableResponseDto }),
    ApiResponse({ status: 401, description: 'Unauthorized.' }),
  );
}

// Swagger docs for fetching app select options
export function ApiFindAppsSelect() {
  return applyDecorators(
    ApiOperation({ summary: 'Get apps for select component' }),
    ApiQuery({ name: 'search', required: false }),
    ApiQuery({ name: 'limit', required: false, type: Number }),
    ApiQuery({ name: 'offset', required: false, type: Number }),
    ApiResponse({ status: 200, description: 'App options retrieved.' }),
    ApiResponse({ status: 401, description: 'Unauthorized.' }),
  );
}

// Swagger docs for getting an app by ID with counts
export function ApiGetAppById() {
  return applyDecorators(
    ApiOperation({ summary: 'Get an app by ID with counts' }),
    ApiParam({ name: 'id', description: 'App UUID', example: '550e8400-e29b-41d4-a716-446655440000' }),
    ApiResponse({ status: 200, description: 'App retrieved successfully.', type: AppDto }),
    ApiResponse({ status: 401, description: 'Unauthorized.' }),
    ApiResponse({ status: 404, description: 'App not found.' }),
  );
}

// Swagger docs for updating an app
export function ApiUpdateApp() {
  return applyDecorators(
    ApiOperation({ summary: 'Update an app' }),
    ApiParam({ name: 'id', description: 'App UUID', example: '550e8400-e29b-41d4-a716-446655440000' }),
    ApiBody({ type: UpdateAppDto }),
    ApiResponse({ status: 200, description: 'App updated successfully.', type: SuccessResponseDto }),
    ApiResponse({ status: 400, description: 'Validation failed.' }),
    ApiResponse({ status: 401, description: 'Unauthorized.' }),
    ApiResponse({ status: 404, description: 'App not found.' }),
    ApiResponse({ status: 409, description: 'App with this code already exists.' }),
  );
}

// Swagger docs for deleting an app
export function ApiDeleteApp() {
  return applyDecorators(
    ApiOperation({ summary: 'Delete an app' }),
    ApiParam({ name: 'id', description: 'App UUID', example: '550e8400-e29b-41d4-a716-446655440000' }),
    ApiResponse({ status: 200, description: 'App deleted successfully.', type: SuccessResponseDto }),
    ApiResponse({ status: 401, description: 'Unauthorized.' }),
    ApiResponse({ status: 404, description: 'App not found.' }),
    ApiResponse({ status: 409, description: 'App is referenced by plans or industries.' }),
  );
}

// Swagger docs for importing apps from a spreadsheet (all-or-nothing)
export function ApiImportApps() {
  return applyDecorators(
    ApiOperation({ summary: 'Import apps from a spreadsheet file (all-or-nothing)' }),
    ApiParam({ name: 'versionId', description: 'App version UUID' }),
    ApiResponse({ status: 200, description: 'Import result with success status or validation errors.' }),
    ApiResponse({ status: 400, description: 'No file provided or spreadsheet is empty.' }),
    ApiResponse({ status: 401, description: 'Unauthorized.' }),
  );
}

// Swagger docs for exporting apps as an Excel file
export function ApiExportApps() {
  return applyDecorators(
    ApiOperation({ summary: 'Export all apps as an Excel file' }),
    ApiParam({ name: 'versionId', description: 'App version UUID' }),
    ApiProduces('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'),
    ApiResponse({ status: 200, description: 'Excel file download.' }),
    ApiResponse({ status: 401, description: 'Unauthorized.' }),
  );
}

