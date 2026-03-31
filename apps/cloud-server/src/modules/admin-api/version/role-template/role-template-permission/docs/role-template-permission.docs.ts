import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { SuccessResponseDto } from '@vritti/api-sdk';
import { AssignRoleTemplatePermissionsDto } from '../dto/request/assign-role-template-permissions.dto';

// Swagger docs for listing permissions for a role template
export function ApiGetRoleTemplatePermissions() {
  return applyDecorators(
    ApiOperation({ summary: 'List permissions for a role template grouped by app' }),
    ApiParam({ name: 'roleTemplateId', description: 'Role template UUID', example: '550e8400-e29b-41d4-a716-446655440000' }),
    ApiResponse({ status: 200, description: 'Permissions retrieved successfully.' }),
    ApiResponse({ status: 401, description: 'Unauthorized.' }),
    ApiResponse({ status: 404, description: 'Role template not found.' }),
  );
}

// Swagger docs for setting permissions on a role template (full replace)
export function ApiSetRoleTemplatePermissions() {
  return applyDecorators(
    ApiOperation({ summary: 'Set permissions for a role template (full replace)' }),
    ApiParam({ name: 'roleTemplateId', description: 'Role template UUID', example: '550e8400-e29b-41d4-a716-446655440000' }),
    ApiBody({ type: AssignRoleTemplatePermissionsDto }),
    ApiResponse({ status: 200, description: 'Permissions updated successfully.', type: SuccessResponseDto }),
    ApiResponse({ status: 400, description: 'Validation failed or missing feature dependencies.' }),
    ApiResponse({ status: 401, description: 'Unauthorized.' }),
    ApiResponse({ status: 404, description: 'Role template not found.' }),
  );
}
