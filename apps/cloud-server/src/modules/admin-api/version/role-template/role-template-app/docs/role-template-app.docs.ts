import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { SuccessResponseDto } from '@vritti/api-sdk';
import { RoleTemplateAppTableResponseDto } from '../dto/response/role-template-app-table-response.dto';

// Swagger docs for listing role template apps in a data table
export function ApiFindForTableRoleTemplateApps() {
  return applyDecorators(
    ApiOperation({ summary: 'List apps for role template data table with assignment status (server-stored state)' }),
    ApiParam({ name: 'roleTemplateId', description: 'Role template UUID', example: '550e8400-e29b-41d4-a716-446655440000' }),
    ApiResponse({ status: 200, description: 'Apps retrieved successfully.', type: RoleTemplateAppTableResponseDto }),
    ApiResponse({ status: 401, description: 'Unauthorized.' }),
  );
}

// Swagger docs for adding an app to a role template
export function ApiAddRoleTemplateApp() {
  return applyDecorators(
    ApiOperation({ summary: 'Add an app to a role template' }),
    ApiParam({ name: 'roleTemplateId', description: 'Role template UUID', example: '550e8400-e29b-41d4-a716-446655440000' }),
    ApiParam({ name: 'appId', description: 'App UUID', example: '550e8400-e29b-41d4-a716-446655440000' }),
    ApiResponse({ status: 201, description: 'App added successfully.', type: SuccessResponseDto }),
    ApiResponse({ status: 401, description: 'Unauthorized.' }),
    ApiResponse({ status: 404, description: 'Role template or app not found.' }),
  );
}

// Swagger docs for removing an app from a role template
export function ApiRemoveRoleTemplateApp() {
  return applyDecorators(
    ApiOperation({ summary: 'Remove an app from a role template' }),
    ApiParam({ name: 'roleTemplateId', description: 'Role template UUID', example: '550e8400-e29b-41d4-a716-446655440000' }),
    ApiParam({ name: 'appId', description: 'App UUID', example: '550e8400-e29b-41d4-a716-446655440000' }),
    ApiResponse({ status: 200, description: 'App removed successfully.', type: SuccessResponseDto }),
    ApiResponse({ status: 401, description: 'Unauthorized.' }),
    ApiResponse({ status: 404, description: 'Role template not found.' }),
    ApiResponse({ status: 409, description: 'App has assigned permissions.' }),
  );
}
