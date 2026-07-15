import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { CreateResponseDto } from '@vritti/api-sdk/database';
import { CoreRoleDto } from '../../dto/entity/core-role.dto';
import { RoleAssignmentDto } from '../../dto/entity/role-assignment.dto';
import { SiteDto } from '../../dto/entity/site.dto';
import { AssignRoleDto } from '../../dto/request/assign-role.dto';
import { SetLocksDto } from '../../dto/request/set-locks.dto';
import { SiteMatrixResponseDto } from '../../dto/response/site-matrix.response.dto';
import { CreateSiteDto } from '../dto/request/create-site.dto';
import { ReorderSitesDto } from '../dto/request/reorder-sites.dto';
import { UpdateSiteDto } from '../dto/request/update-site.dto';
import { SiteListResponseDto } from '../dto/response/site-list.response.dto';

export function ApiListSites() {
  return applyDecorators(
    ApiOperation({
      summary: 'List organization sites',
      description: 'Proxies to core to return all sites for the organization.',
    }),
    ApiParam({ name: 'orgId', type: String, description: 'Organization ID' }),
    ApiResponse({ status: 200, description: 'Sites retrieved successfully.', type: SiteListResponseDto }),
    ApiResponse({ status: 401, description: 'Unauthorized.' }),
    ApiResponse({ status: 404, description: 'Organization or deployment not found.' }),
    ApiResponse({ status: 503, description: 'Deployment unreachable.' }),
  );
}

export function ApiCreateSite() {
  return applyDecorators(
    ApiOperation({
      summary: 'Create a site',
      description: 'Proxies to core to create a new site. Checks plan limits before creating.',
    }),
    ApiParam({ name: 'orgId', type: String, description: 'Organization ID' }),
    ApiBody({ type: CreateSiteDto }),
    ApiResponse({ status: 201, description: 'Site created successfully.', type: CreateResponseDto }),
    ApiResponse({ status: 400, description: 'Validation failed.' }),
    ApiResponse({ status: 403, description: 'Site limit reached for the plan.' }),
    ApiResponse({ status: 404, description: 'Organization or deployment not found.' }),
    ApiResponse({ status: 503, description: 'Deployment unreachable.' }),
  );
}

export function ApiGetSite() {
  return applyDecorators(
    ApiOperation({
      summary: 'Get a site',
      description: 'Proxies to core to return a single site by ID.',
    }),
    ApiParam({ name: 'orgId', type: String, description: 'Organization ID' }),
    ApiParam({ name: 'siteId', type: String, description: 'Site ID' }),
    ApiResponse({ status: 200, description: 'Site retrieved successfully.', type: SiteDto }),
    ApiResponse({ status: 404, description: 'Organization, deployment, or site not found.' }),
    ApiResponse({ status: 503, description: 'Deployment unreachable.' }),
  );
}

export function ApiReorderSites() {
  return applyDecorators(
    ApiOperation({
      summary: 'Reorder sites',
      description:
        'Proxies to core to reassign sort order for a batch of sibling sites in their new left-to-right order.',
    }),
    ApiParam({ name: 'orgId', type: String, description: 'Organization ID' }),
    ApiBody({ type: ReorderSitesDto }),
    ApiResponse({ status: 200, description: 'Sites reordered successfully.' }),
    ApiResponse({ status: 400, description: 'One or more sites do not belong to the organization.' }),
    ApiResponse({ status: 404, description: 'Organization or deployment not found.' }),
    ApiResponse({ status: 503, description: 'Deployment unreachable.' }),
  );
}

export function ApiUpdateSite() {
  return applyDecorators(
    ApiOperation({
      summary: 'Update a site',
      description: 'Proxies to core to update a site.',
    }),
    ApiParam({ name: 'orgId', type: String, description: 'Organization ID' }),
    ApiParam({ name: 'siteId', type: String, description: 'Site ID' }),
    ApiBody({ type: UpdateSiteDto }),
    ApiResponse({ status: 200, description: 'Site updated successfully.' }),
    ApiResponse({ status: 400, description: 'Validation failed.' }),
    ApiResponse({ status: 404, description: 'Organization, deployment, or site not found.' }),
    ApiResponse({ status: 503, description: 'Deployment unreachable.' }),
  );
}

export function ApiGetSitePermissions() {
  return applyDecorators(
    ApiOperation({
      summary: 'Get site permission matrix',
      description:
        "Returns the site permission matrix built from the version snapshot — the plan ceiling minus the site's lock deny-list.",
    }),
    ApiParam({ name: 'orgId', type: String, description: 'Organization ID' }),
    ApiParam({ name: 'siteId', type: String, description: 'Site ID' }),
    ApiResponse({ status: 200, description: 'Matrix retrieved successfully.', type: SiteMatrixResponseDto }),
    ApiResponse({ status: 404, description: 'Organization, deployment, or plan not found.' }),
  );
}

export function ApiUpdateSitePermissions() {
  return applyDecorators(
    ApiOperation({
      summary: 'Replace site permission locks',
      description:
        "Replaces the site's lock deny-list (featureCode → { web?, mobile? }; platform null locks the whole feature) and pushes the overlay to core. Locks on out-of-plan codes are inert — the plan remains the ceiling.",
    }),
    ApiParam({ name: 'orgId', type: String, description: 'Organization ID' }),
    ApiParam({ name: 'siteId', type: String, description: 'Site ID' }),
    ApiBody({ type: SetLocksDto }),
    ApiResponse({ status: 200, description: 'Site permissions updated successfully.' }),
    ApiResponse({ status: 400, description: 'Invalid lock shape.' }),
    ApiResponse({ status: 404, description: 'Organization or deployment not found.' }),
    ApiResponse({ status: 503, description: 'Deployment unreachable.' }),
  );
}

export function ApiGetCompatibleRoles() {
  return applyDecorators(
    ApiOperation({
      summary: 'Get compatible roles',
      description: "Proxies to core to return roles compatible with the site's assigned apps.",
    }),
    ApiParam({ name: 'orgId', type: String, description: 'Organization ID' }),
    ApiParam({ name: 'siteId', type: String, description: 'Site ID' }),
    ApiResponse({ status: 200, description: 'Roles retrieved successfully.', type: [CoreRoleDto] }),
    ApiResponse({ status: 404, description: 'Organization or deployment not found.' }),
    ApiResponse({ status: 503, description: 'Deployment unreachable.' }),
  );
}

export function ApiGetRoleAssignments() {
  return applyDecorators(
    ApiOperation({
      summary: 'List site role assignments',
      description: 'Proxies to core to return all role assignments for a site.',
    }),
    ApiParam({ name: 'orgId', type: String, description: 'Organization ID' }),
    ApiParam({ name: 'siteId', type: String, description: 'Site ID' }),
    ApiResponse({
      status: 200,
      description: 'Role assignments retrieved successfully.',
      type: [RoleAssignmentDto],
    }),
    ApiResponse({ status: 404, description: 'Organization or deployment not found.' }),
    ApiResponse({ status: 503, description: 'Deployment unreachable.' }),
  );
}

export function ApiAssignSiteRole() {
  return applyDecorators(
    ApiOperation({
      summary: 'Assign a role at a site',
      description: 'Proxies to core to assign a role to a user at the site.',
    }),
    ApiParam({ name: 'orgId', type: String, description: 'Organization ID' }),
    ApiParam({ name: 'siteId', type: String, description: 'Site ID' }),
    ApiBody({ type: AssignRoleDto }),
    ApiResponse({ status: 201, description: 'Role assigned successfully.', type: CreateResponseDto }),
    ApiResponse({ status: 400, description: 'Validation failed.' }),
    ApiResponse({ status: 404, description: 'Organization, deployment, user, or role not found.' }),
    ApiResponse({ status: 503, description: 'Deployment unreachable.' }),
  );
}

export function ApiRemoveSiteRoleAssignment() {
  return applyDecorators(
    ApiOperation({
      summary: 'Remove a site role assignment',
      description: 'Proxies to core to remove a role assignment from the site.',
    }),
    ApiParam({ name: 'orgId', type: String, description: 'Organization ID' }),
    ApiParam({ name: 'siteId', type: String, description: 'Site ID' }),
    ApiParam({ name: 'assignmentId', type: String, description: 'Role assignment ID' }),
    ApiResponse({ status: 200, description: 'Role assignment removed successfully.' }),
    ApiResponse({ status: 404, description: 'Organization, deployment, or assignment not found.' }),
    ApiResponse({ status: 503, description: 'Deployment unreachable.' }),
  );
}

export function ApiDeleteSite() {
  return applyDecorators(
    ApiOperation({
      summary: 'Delete a site',
      description: 'Proxies to core to delete a site.',
    }),
    ApiParam({ name: 'orgId', type: String, description: 'Organization ID' }),
    ApiParam({ name: 'siteId', type: String, description: 'Site ID' }),
    ApiResponse({ status: 200, description: 'Site deleted successfully.' }),
    ApiResponse({ status: 404, description: 'Organization, deployment, or site not found.' }),
    ApiResponse({ status: 503, description: 'Deployment unreachable.' }),
  );
}
