import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { SuccessResponseDto } from '@vritti/api-sdk';
import { RoleTemplateDto } from '../dto/entity/role-template.dto';
import { CreateRoleTemplateDto } from '../dto/request/create-role-template.dto';

import { UpdateRoleTemplateDto } from '../dto/request/update-role-template.dto';
import { RoleTemplateTableResponseDto } from '../dto/response/role-template-table-response.dto';

// Swagger docs for creating a role template
export function ApiCreateRoleTemplate() {
  return applyDecorators(
    ApiOperation({ summary: 'Create a new role template' }),
    ApiBody({ type: CreateRoleTemplateDto }),
    ApiResponse({ status: 201, description: 'Role template created successfully.', type: RoleTemplateDto }),
    ApiResponse({ status: 400, description: 'Validation failed.' }),
    ApiResponse({ status: 401, description: 'Unauthorized.' }),
  );
}

// Swagger docs for listing role templates in a data table
export function ApiFindForTableRoleTemplates() {
  return applyDecorators(
    ApiOperation({ summary: 'List role templates for data table (server-stored state)' }),
    ApiResponse({ status: 200, description: 'Role templates retrieved successfully.', type: RoleTemplateTableResponseDto }),
    ApiResponse({ status: 401, description: 'Unauthorized.' }),
  );
}

// Swagger docs for fetching role template select options
export function ApiFindRoleTemplatesSelect() {
  return applyDecorators(
    ApiOperation({ summary: 'Get role templates for select component' }),
    ApiQuery({ name: 'search', required: false }),
    ApiQuery({ name: 'limit', required: false, type: Number }),
    ApiQuery({ name: 'offset', required: false, type: Number }),
    ApiQuery({ name: 'industryId', required: false, description: 'Filter role templates by industry UUID' }),
    ApiResponse({ status: 200, description: 'Role template options retrieved.' }),
    ApiResponse({ status: 401, description: 'Unauthorized.' }),
  );
}

// Swagger docs for getting a role template by ID
export function ApiGetRoleTemplateById() {
  return applyDecorators(
    ApiOperation({ summary: 'Get a role template by ID with permissions grouped by app' }),
    ApiParam({ name: 'id', description: 'Role template UUID', example: '550e8400-e29b-41d4-a716-446655440000' }),
    ApiResponse({ status: 200, description: 'Role template retrieved successfully.', type: RoleTemplateDto }),
    ApiResponse({ status: 401, description: 'Unauthorized.' }),
    ApiResponse({ status: 404, description: 'Role template not found.' }),
  );
}

// Swagger docs for updating a role template
export function ApiUpdateRoleTemplate() {
  return applyDecorators(
    ApiOperation({ summary: 'Update a role template' }),
    ApiParam({ name: 'id', description: 'Role template UUID', example: '550e8400-e29b-41d4-a716-446655440000' }),
    ApiBody({ type: UpdateRoleTemplateDto }),
    ApiResponse({ status: 200, description: 'Role template updated successfully.', type: SuccessResponseDto }),
    ApiResponse({ status: 400, description: 'Validation failed.' }),
    ApiResponse({ status: 401, description: 'Unauthorized.' }),
    ApiResponse({ status: 404, description: 'Role template not found.' }),
  );
}

// Swagger docs for deleting a role template
export function ApiDeleteRoleTemplate() {
  return applyDecorators(
    ApiOperation({ summary: 'Delete a role template' }),
    ApiParam({ name: 'id', description: 'Role template UUID', example: '550e8400-e29b-41d4-a716-446655440000' }),
    ApiResponse({ status: 200, description: 'Role template deleted successfully.', type: SuccessResponseDto }),
    ApiResponse({ status: 401, description: 'Unauthorized.' }),
    ApiResponse({ status: 404, description: 'Role template not found.' }),
    ApiResponse({ status: 409, description: 'Cannot delete system role template.' }),
  );
}
