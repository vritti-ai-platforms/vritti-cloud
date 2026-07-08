import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { CreateResponseDto, SuccessResponseDto } from '@vritti/api-sdk/database';
import { BulkCreatePermissionsDto } from '../dto/request/bulk-create-permissions.dto';
import { CreateFeaturePermissionDto } from '../dto/request/create-feature-permission.dto';
import { UpdateFeaturePermissionDto } from '../dto/request/update-feature-permission.dto';
import { PermissionUsageResponseDto } from '../dto/response/permission-usage-response.dto';

// Swagger docs for bulk-creating feature permissions
export function ApiBulkCreatePermissions() {
  return applyDecorators(
    ApiOperation({ summary: 'Bulk-create feature permissions in one request' }),
    ApiParam({ name: 'versionId', description: 'Version UUID', example: '550e8400-e29b-41d4-a716-446655440000' }),
    ApiBody({ type: BulkCreatePermissionsDto }),
    ApiResponse({ status: 201, description: 'Permissions created successfully.', type: SuccessResponseDto }),
    ApiResponse({ status: 400, description: 'Validation failed.' }),
    ApiResponse({ status: 401, description: 'Unauthorized.' }),
    ApiResponse({ status: 404, description: 'Feature not found.' }),
    ApiResponse({ status: 409, description: 'Duplicate permission code.' }),
  );
}

// Swagger docs for creating a feature permission
export function ApiCreatePermission() {
  return applyDecorators(
    ApiOperation({ summary: 'Create a feature permission (global or business-scoped)' }),
    ApiParam({ name: 'versionId', description: 'Version UUID', example: '550e8400-e29b-41d4-a716-446655440000' }),
    ApiBody({ type: CreateFeaturePermissionDto }),
    ApiResponse({ status: 201, description: 'Permission created successfully.', type: CreateResponseDto }),
    ApiResponse({ status: 400, description: 'Validation failed.' }),
    ApiResponse({ status: 401, description: 'Unauthorized.' }),
    ApiResponse({ status: 404, description: 'Feature not found.' }),
    ApiResponse({ status: 409, description: 'Permission with this code already exists.' }),
  );
}

// Swagger docs for updating a feature permission
export function ApiUpdatePermission() {
  return applyDecorators(
    ApiOperation({ summary: 'Update a feature permission' }),
    ApiParam({ name: 'permissionId', description: 'Permission UUID', example: '550e8400-e29b-41d4-a716-446655440000' }),
    ApiBody({ type: UpdateFeaturePermissionDto }),
    ApiResponse({ status: 200, description: 'Permission updated successfully.', type: SuccessResponseDto }),
    ApiResponse({ status: 400, description: 'Validation failed.' }),
    ApiResponse({ status: 401, description: 'Unauthorized.' }),
    ApiResponse({ status: 404, description: 'Permission not found.' }),
    ApiResponse({ status: 409, description: 'Permission with this code already exists.' }),
  );
}

// Swagger docs for a permission's business-wise usage (delete-impact)
export function ApiPermissionUsage() {
  return applyDecorators(
    ApiOperation({
      summary: 'Permission usage (business-wise)',
      description: 'Plans that unlock and role templates that grant this permission, grouped by business.',
    }),
    ApiParam({ name: 'permissionId', description: 'Permission UUID', example: '550e8400-e29b-41d4-a716-446655440000' }),
    ApiResponse({ status: 200, description: 'Usage retrieved.', type: PermissionUsageResponseDto }),
    ApiResponse({ status: 404, description: 'Permission not found.' }),
  );
}

// Swagger docs for deleting a feature permission
export function ApiDeletePermission() {
  return applyDecorators(
    ApiOperation({ summary: 'Delete a feature permission' }),
    ApiParam({ name: 'permissionId', description: 'Permission UUID', example: '550e8400-e29b-41d4-a716-446655440000' }),
    ApiResponse({ status: 200, description: 'Permission deleted successfully.', type: SuccessResponseDto }),
    ApiResponse({ status: 401, description: 'Unauthorized.' }),
    ApiResponse({ status: 404, description: 'Permission not found.' }),
  );
}
