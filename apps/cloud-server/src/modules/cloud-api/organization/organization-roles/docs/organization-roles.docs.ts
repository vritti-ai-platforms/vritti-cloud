import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { RoleTemplateListResponseDto } from '../dto/response/role-template.response.dto';

export function ApiGetOrgRoleTemplates() {
  return applyDecorators(
    ApiOperation({
      summary: 'Get role templates',
      description: 'Returns role templates from the app version snapshot for the organization deployment.',
    }),
    ApiParam({ name: 'orgId', type: String, description: 'Organization ID' }),
    ApiResponse({ status: 200, description: 'Role templates retrieved successfully.', type: RoleTemplateListResponseDto }),
    ApiResponse({ status: 401, description: 'Unauthorized.' }),
    ApiResponse({ status: 404, description: 'Organization, deployment, or snapshot not found.' }),
  );
}

export function ApiListOrgRoles() {
  return applyDecorators(
    ApiOperation({
      summary: 'List organization roles',
      description: 'Proxies to core to return all roles for the organization.',
    }),
    ApiParam({ name: 'orgId', type: String, description: 'Organization ID' }),
    ApiResponse({ status: 200, description: 'Roles retrieved successfully.' }),
    ApiResponse({ status: 401, description: 'Unauthorized.' }),
    ApiResponse({ status: 404, description: 'Organization or deployment not found.' }),
    ApiResponse({ status: 503, description: 'Deployment unreachable.' }),
  );
}

export function ApiCreateOrgRole() {
  return applyDecorators(
    ApiOperation({
      summary: 'Create an organization role',
      description: 'Proxies to core to create a new role for the organization.',
    }),
    ApiParam({ name: 'orgId', type: String, description: 'Organization ID' }),
    ApiResponse({ status: 201, description: 'Role created successfully.' }),
    ApiResponse({ status: 400, description: 'Validation failed.' }),
    ApiResponse({ status: 404, description: 'Organization or deployment not found.' }),
    ApiResponse({ status: 503, description: 'Deployment unreachable.' }),
  );
}

export function ApiUpdateOrgRole() {
  return applyDecorators(
    ApiOperation({
      summary: 'Update an organization role',
      description: 'Proxies to core to update a role for the organization.',
    }),
    ApiParam({ name: 'orgId', type: String, description: 'Organization ID' }),
    ApiParam({ name: 'roleId', type: String, description: 'Role ID to update' }),
    ApiResponse({ status: 200, description: 'Role updated successfully.' }),
    ApiResponse({ status: 400, description: 'Validation failed.' }),
    ApiResponse({ status: 404, description: 'Organization, deployment, or role not found.' }),
    ApiResponse({ status: 503, description: 'Deployment unreachable.' }),
  );
}

export function ApiDeleteOrgRole() {
  return applyDecorators(
    ApiOperation({
      summary: 'Delete an organization role',
      description: 'Proxies to core to delete a role for the organization.',
    }),
    ApiParam({ name: 'orgId', type: String, description: 'Organization ID' }),
    ApiParam({ name: 'roleId', type: String, description: 'Role ID to delete' }),
    ApiResponse({ status: 200, description: 'Role deleted successfully.' }),
    ApiResponse({ status: 404, description: 'Organization, deployment, or role not found.' }),
    ApiResponse({ status: 503, description: 'Deployment unreachable.' }),
  );
}
