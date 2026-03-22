import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { SuccessResponseDto } from '@vritti/api-sdk';
import { RoleDto } from '../dto/entity/role.dto';
import { CreateRoleDto } from '../dto/request/create-role.dto';

import { UpdateRoleDto } from '../dto/request/update-role.dto';
import { RoleTableResponseDto } from '../dto/response/role-table-response.dto';

// Swagger docs for creating a role
export function ApiCreateRole() {
  return applyDecorators(
    ApiOperation({ summary: 'Create a new role template' }),
    ApiBody({ type: CreateRoleDto }),
    ApiResponse({ status: 201, description: 'Role created successfully.', type: RoleDto }),
    ApiResponse({ status: 400, description: 'Validation failed.' }),
    ApiResponse({ status: 401, description: 'Unauthorized.' }),
  );
}

// Swagger docs for listing roles in a data table
export function ApiFindForTableRoles() {
  return applyDecorators(
    ApiOperation({ summary: 'List roles for data table (server-stored state)' }),
    ApiResponse({ status: 200, description: 'Roles retrieved successfully.', type: RoleTableResponseDto }),
    ApiResponse({ status: 401, description: 'Unauthorized.' }),
  );
}

// Swagger docs for fetching role select options
export function ApiFindRolesSelect() {
  return applyDecorators(
    ApiOperation({ summary: 'Get roles for select component' }),
    ApiQuery({ name: 'search', required: false }),
    ApiQuery({ name: 'limit', required: false, type: Number }),
    ApiQuery({ name: 'offset', required: false, type: Number }),
    ApiQuery({ name: 'industryId', required: false, description: 'Filter roles by industry UUID' }),
    ApiResponse({ status: 200, description: 'Role options retrieved.' }),
    ApiResponse({ status: 401, description: 'Unauthorized.' }),
  );
}

// Swagger docs for getting a role by ID
export function ApiGetRoleById() {
  return applyDecorators(
    ApiOperation({ summary: 'Get a role by ID with permissions grouped by app' }),
    ApiParam({ name: 'id', description: 'Role UUID', example: '550e8400-e29b-41d4-a716-446655440000' }),
    ApiResponse({ status: 200, description: 'Role retrieved successfully.', type: RoleDto }),
    ApiResponse({ status: 401, description: 'Unauthorized.' }),
    ApiResponse({ status: 404, description: 'Role not found.' }),
  );
}

// Swagger docs for updating a role
export function ApiUpdateRole() {
  return applyDecorators(
    ApiOperation({ summary: 'Update a role template' }),
    ApiParam({ name: 'id', description: 'Role UUID', example: '550e8400-e29b-41d4-a716-446655440000' }),
    ApiBody({ type: UpdateRoleDto }),
    ApiResponse({ status: 200, description: 'Role updated successfully.', type: SuccessResponseDto }),
    ApiResponse({ status: 400, description: 'Validation failed.' }),
    ApiResponse({ status: 401, description: 'Unauthorized.' }),
    ApiResponse({ status: 404, description: 'Role not found.' }),
  );
}

// Swagger docs for deleting a role
export function ApiDeleteRole() {
  return applyDecorators(
    ApiOperation({ summary: 'Delete a role template' }),
    ApiParam({ name: 'id', description: 'Role UUID', example: '550e8400-e29b-41d4-a716-446655440000' }),
    ApiResponse({ status: 200, description: 'Role deleted successfully.', type: SuccessResponseDto }),
    ApiResponse({ status: 401, description: 'Unauthorized.' }),
    ApiResponse({ status: 404, description: 'Role not found.' }),
    ApiResponse({ status: 409, description: 'Cannot delete system role.' }),
  );
}
