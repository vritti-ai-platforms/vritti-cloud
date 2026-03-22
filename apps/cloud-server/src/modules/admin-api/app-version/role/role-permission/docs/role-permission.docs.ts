import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { SuccessResponseDto } from '@vritti/api-sdk';
import { AssignRolePermissionsDto } from '../dto/request/assign-role-permissions.dto';

// Swagger docs for listing permissions for a role
export function ApiGetRolePermissions() {
  return applyDecorators(
    ApiOperation({ summary: 'List permissions for a role grouped by app' }),
    ApiParam({ name: 'roleId', description: 'Role UUID', example: '550e8400-e29b-41d4-a716-446655440000' }),
    ApiResponse({ status: 200, description: 'Permissions retrieved successfully.' }),
    ApiResponse({ status: 401, description: 'Unauthorized.' }),
    ApiResponse({ status: 404, description: 'Role not found.' }),
  );
}

// Swagger docs for setting permissions on a role (full replace)
export function ApiSetRolePermissions() {
  return applyDecorators(
    ApiOperation({ summary: 'Set permissions for a role (full replace)' }),
    ApiParam({ name: 'roleId', description: 'Role UUID', example: '550e8400-e29b-41d4-a716-446655440000' }),
    ApiBody({ type: AssignRolePermissionsDto }),
    ApiResponse({ status: 200, description: 'Permissions updated successfully.', type: SuccessResponseDto }),
    ApiResponse({ status: 400, description: 'Validation failed or missing feature dependencies.' }),
    ApiResponse({ status: 401, description: 'Unauthorized.' }),
    ApiResponse({ status: 404, description: 'Role not found.' }),
  );
}
