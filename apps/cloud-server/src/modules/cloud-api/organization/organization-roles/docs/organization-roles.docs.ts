import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { RoleScopeSectionDto } from '../dto/response/role-sections.response.dto';

export function ApiListOrgRoles() {
  return applyDecorators(
    ApiOperation({
      summary: 'List organization roles',
      description: "Returns the organization's roles as render-ready sections (templates + custom roles per scope).",
    }),
    ApiParam({ name: 'orgId', type: String, description: 'Organization ID' }),
    ApiResponse({
      status: 200,
      description: 'Role sections retrieved successfully.',
      type: RoleScopeSectionDto,
      isArray: true,
    }),
    ApiResponse({ status: 401, description: 'Unauthorized.' }),
    ApiResponse({ status: 404, description: 'Organization, deployment, or snapshot not found.' }),
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
