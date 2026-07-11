import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { CreateResponseDto } from '@vritti/api-sdk/database';
import { CoreRoleDto } from '../../dto/entity/core-role.dto';
import { RoleAssignmentDto } from '../../dto/entity/role-assignment.dto';
import { AssignRoleDto } from '../../dto/request/assign-role.dto';
import { CreateLeTaxRegistrationDto } from '../dto/request/create-le-tax-registration.dto';
import { CreateLegalEntityDto } from '../dto/request/create-legal-entity.dto';
import { CreateSiteGroupDto } from '../dto/request/create-site-group.dto';
import { UpdateLegalEntityDto } from '../dto/request/update-legal-entity.dto';
import { UpdateSiteGroupDto } from '../dto/request/update-site-group.dto';
import { StructureResponseDto } from '../dto/response/structure.response.dto';

export function ApiGetStructure() {
  return applyDecorators(
    ApiOperation({
      summary: 'Get organization structure',
      description:
        'Proxies to core to return the structure aggregate: organization, legal entities, tax registrations, sites, and site groups.',
    }),
    ApiParam({ name: 'orgId', type: String, description: 'Organization ID' }),
    ApiResponse({ status: 200, description: 'Structure retrieved successfully.', type: StructureResponseDto }),
    ApiResponse({ status: 401, description: 'Unauthorized.' }),
    ApiResponse({ status: 404, description: 'Organization or deployment not found.' }),
    ApiResponse({ status: 503, description: 'Deployment unreachable.' }),
  );
}

export function ApiCreateLegalEntity() {
  return applyDecorators(
    ApiOperation({
      summary: 'Create a legal entity',
      description: 'Proxies to core to create a new legal entity for the organization.',
    }),
    ApiParam({ name: 'orgId', type: String, description: 'Organization ID' }),
    ApiBody({ type: CreateLegalEntityDto }),
    ApiResponse({ status: 201, description: 'Legal entity created successfully.' }),
    ApiResponse({ status: 400, description: 'Validation failed.' }),
    ApiResponse({ status: 404, description: 'Organization or deployment not found.' }),
    ApiResponse({ status: 503, description: 'Deployment unreachable.' }),
  );
}

export function ApiUpdateLegalEntity() {
  return applyDecorators(
    ApiOperation({
      summary: 'Update a legal entity',
      description: 'Proxies to core to update a legal entity.',
    }),
    ApiParam({ name: 'orgId', type: String, description: 'Organization ID' }),
    ApiParam({ name: 'leId', type: String, description: 'Legal entity ID' }),
    ApiBody({ type: UpdateLegalEntityDto }),
    ApiResponse({ status: 200, description: 'Legal entity updated successfully.' }),
    ApiResponse({ status: 400, description: 'Validation failed.' }),
    ApiResponse({ status: 404, description: 'Organization, deployment, or legal entity not found.' }),
    ApiResponse({ status: 503, description: 'Deployment unreachable.' }),
  );
}

export function ApiAddLeTaxRegistration() {
  return applyDecorators(
    ApiOperation({
      summary: 'Add a tax registration to a legal entity',
      description: 'Proxies to core to add a tax registration (GSTIN, TRN, VAT number) to a legal entity.',
    }),
    ApiParam({ name: 'orgId', type: String, description: 'Organization ID' }),
    ApiParam({ name: 'leId', type: String, description: 'Legal entity ID' }),
    ApiBody({ type: CreateLeTaxRegistrationDto }),
    ApiResponse({ status: 201, description: 'Tax registration added successfully.' }),
    ApiResponse({ status: 400, description: 'Validation failed.' }),
    ApiResponse({ status: 404, description: 'Organization, deployment, or legal entity not found.' }),
    ApiResponse({ status: 503, description: 'Deployment unreachable.' }),
  );
}

export function ApiDeleteLegalEntity() {
  return applyDecorators(
    ApiOperation({
      summary: 'Delete a legal entity',
      description:
        'Proxies to core to delete a legal entity. Fails if sites are linked to it or it has child legal entities.',
    }),
    ApiParam({ name: 'orgId', type: String, description: 'Organization ID' }),
    ApiParam({ name: 'leId', type: String, description: 'Legal entity ID' }),
    ApiResponse({ status: 200, description: 'Legal entity deleted successfully.' }),
    ApiResponse({ status: 404, description: 'Organization, deployment, or legal entity not found.' }),
    ApiResponse({ status: 409, description: 'Legal entity is linked to sites or has child legal entities.' }),
    ApiResponse({ status: 503, description: 'Deployment unreachable.' }),
  );
}

export function ApiCreateSiteGroup() {
  return applyDecorators(
    ApiOperation({
      summary: 'Create a site group',
      description: 'Proxies to core to create a new site group for the organization.',
    }),
    ApiParam({ name: 'orgId', type: String, description: 'Organization ID' }),
    ApiBody({ type: CreateSiteGroupDto }),
    ApiResponse({ status: 201, description: 'Site group created successfully.' }),
    ApiResponse({ status: 400, description: 'Validation failed.' }),
    ApiResponse({ status: 404, description: 'Organization or deployment not found.' }),
    ApiResponse({ status: 503, description: 'Deployment unreachable.' }),
  );
}

export function ApiUpdateSiteGroup() {
  return applyDecorators(
    ApiOperation({
      summary: 'Update a site group',
      description: 'Proxies to core to update a site group (rename, re-parent, activate/deactivate).',
    }),
    ApiParam({ name: 'orgId', type: String, description: 'Organization ID' }),
    ApiParam({ name: 'groupId', type: String, description: 'Site group ID' }),
    ApiBody({ type: UpdateSiteGroupDto }),
    ApiResponse({ status: 200, description: 'Site group updated successfully.' }),
    ApiResponse({ status: 400, description: 'Validation failed.' }),
    ApiResponse({ status: 404, description: 'Organization, deployment, or site group not found.' }),
    ApiResponse({ status: 503, description: 'Deployment unreachable.' }),
  );
}

export function ApiDeleteSiteGroup() {
  return applyDecorators(
    ApiOperation({
      summary: 'Delete a site group',
      description: 'Proxies to core to delete a site group. Fails if sites or child groups still reference it.',
    }),
    ApiParam({ name: 'orgId', type: String, description: 'Organization ID' }),
    ApiParam({ name: 'groupId', type: String, description: 'Site group ID' }),
    ApiResponse({ status: 200, description: 'Site group deleted successfully.' }),
    ApiResponse({ status: 404, description: 'Organization, deployment, or site group not found.' }),
    ApiResponse({ status: 409, description: 'Site group still has member sites or child groups.' }),
    ApiResponse({ status: 503, description: 'Deployment unreachable.' }),
  );
}

export function ApiDeleteLeTaxRegistration() {
  return applyDecorators(
    ApiOperation({
      summary: 'Delete a tax registration',
      description: 'Proxies to core to delete a tax registration from a legal entity. Fails if sites are linked to it.',
    }),
    ApiParam({ name: 'orgId', type: String, description: 'Organization ID' }),
    ApiParam({ name: 'leId', type: String, description: 'Legal entity ID' }),
    ApiParam({ name: 'regId', type: String, description: 'Tax registration ID' }),
    ApiResponse({ status: 200, description: 'Tax registration deleted successfully.' }),
    ApiResponse({ status: 404, description: 'Organization, deployment, legal entity, or tax registration not found.' }),
    ApiResponse({ status: 409, description: 'Tax registration is linked to sites.' }),
    ApiResponse({ status: 503, description: 'Deployment unreachable.' }),
  );
}

export function ApiGetSiteGroupRoleAssignments() {
  return applyDecorators(
    ApiOperation({
      summary: 'List site group role assignments',
      description: 'Proxies to core to return all role assignments targeting the site group.',
    }),
    ApiParam({ name: 'orgId', type: String, description: 'Organization ID' }),
    ApiParam({ name: 'groupId', type: String, description: 'Site group ID' }),
    ApiResponse({ status: 200, description: 'Role assignments retrieved successfully.', type: [RoleAssignmentDto] }),
    ApiResponse({ status: 404, description: 'Organization or deployment not found.' }),
    ApiResponse({ status: 503, description: 'Deployment unreachable.' }),
  );
}

export function ApiAssignSiteGroupRole() {
  return applyDecorators(
    ApiOperation({
      summary: 'Assign a role at a site group',
      description: 'Proxies to core to assign a role to a user at the site group.',
    }),
    ApiParam({ name: 'orgId', type: String, description: 'Organization ID' }),
    ApiParam({ name: 'groupId', type: String, description: 'Site group ID' }),
    ApiBody({ type: AssignRoleDto }),
    ApiResponse({ status: 201, description: 'Role assigned successfully.', type: CreateResponseDto }),
    ApiResponse({ status: 400, description: 'Validation failed.' }),
    ApiResponse({ status: 404, description: 'Organization, deployment, user, or role not found.' }),
    ApiResponse({ status: 503, description: 'Deployment unreachable.' }),
  );
}

export function ApiRemoveSiteGroupRoleAssignment() {
  return applyDecorators(
    ApiOperation({
      summary: 'Remove a site group role assignment',
      description: 'Proxies to core to remove a role assignment from the site group.',
    }),
    ApiParam({ name: 'orgId', type: String, description: 'Organization ID' }),
    ApiParam({ name: 'groupId', type: String, description: 'Site group ID' }),
    ApiParam({ name: 'assignmentId', type: String, description: 'Role assignment ID' }),
    ApiResponse({ status: 200, description: 'Role assignment removed successfully.' }),
    ApiResponse({ status: 404, description: 'Organization, deployment, or assignment not found.' }),
    ApiResponse({ status: 503, description: 'Deployment unreachable.' }),
  );
}

export function ApiGetSiteGroupCompatibleRoles() {
  return applyDecorators(
    ApiOperation({
      summary: 'Get site group compatible roles',
      description:
        'Proxies to core to return roles assignable at the site group — SITE_GROUP-scoped templates, SITE-scoped templates, and custom roles.',
    }),
    ApiParam({ name: 'orgId', type: String, description: 'Organization ID' }),
    ApiParam({ name: 'groupId', type: String, description: 'Site group ID' }),
    ApiResponse({ status: 200, description: 'Roles retrieved successfully.', type: [CoreRoleDto] }),
    ApiResponse({ status: 404, description: 'Organization or deployment not found.' }),
    ApiResponse({ status: 503, description: 'Deployment unreachable.' }),
  );
}

export function ApiGetLegalEntityRoleAssignments() {
  return applyDecorators(
    ApiOperation({
      summary: 'List legal entity role assignments',
      description: 'Proxies to core to return all role assignments targeting the legal entity.',
    }),
    ApiParam({ name: 'orgId', type: String, description: 'Organization ID' }),
    ApiParam({ name: 'leId', type: String, description: 'Legal entity ID' }),
    ApiResponse({ status: 200, description: 'Role assignments retrieved successfully.', type: [RoleAssignmentDto] }),
    ApiResponse({ status: 404, description: 'Organization or deployment not found.' }),
    ApiResponse({ status: 503, description: 'Deployment unreachable.' }),
  );
}

export function ApiAssignLegalEntityRole() {
  return applyDecorators(
    ApiOperation({
      summary: 'Assign a role at a legal entity',
      description: 'Proxies to core to assign a role to a user at the legal entity.',
    }),
    ApiParam({ name: 'orgId', type: String, description: 'Organization ID' }),
    ApiParam({ name: 'leId', type: String, description: 'Legal entity ID' }),
    ApiBody({ type: AssignRoleDto }),
    ApiResponse({ status: 201, description: 'Role assigned successfully.', type: CreateResponseDto }),
    ApiResponse({ status: 400, description: 'Validation failed.' }),
    ApiResponse({ status: 404, description: 'Organization, deployment, user, or role not found.' }),
    ApiResponse({ status: 503, description: 'Deployment unreachable.' }),
  );
}

export function ApiRemoveLegalEntityRoleAssignment() {
  return applyDecorators(
    ApiOperation({
      summary: 'Remove a legal entity role assignment',
      description: 'Proxies to core to remove a role assignment from the legal entity.',
    }),
    ApiParam({ name: 'orgId', type: String, description: 'Organization ID' }),
    ApiParam({ name: 'leId', type: String, description: 'Legal entity ID' }),
    ApiParam({ name: 'assignmentId', type: String, description: 'Role assignment ID' }),
    ApiResponse({ status: 200, description: 'Role assignment removed successfully.' }),
    ApiResponse({ status: 404, description: 'Organization, deployment, or assignment not found.' }),
    ApiResponse({ status: 503, description: 'Deployment unreachable.' }),
  );
}

export function ApiGetLegalEntityCompatibleRoles() {
  return applyDecorators(
    ApiOperation({
      summary: 'Get legal entity compatible roles',
      description:
        'Proxies to core to return roles assignable at the legal entity — LE-scoped templates, SITE-scoped templates, and custom roles.',
    }),
    ApiParam({ name: 'orgId', type: String, description: 'Organization ID' }),
    ApiParam({ name: 'leId', type: String, description: 'Legal entity ID' }),
    ApiResponse({ status: 200, description: 'Roles retrieved successfully.', type: [CoreRoleDto] }),
    ApiResponse({ status: 404, description: 'Organization or deployment not found.' }),
    ApiResponse({ status: 503, description: 'Deployment unreachable.' }),
  );
}

export function ApiGetOrgRoleAssignments() {
  return applyDecorators(
    ApiOperation({
      summary: 'List org-wide role assignments',
      description:
        'Proxies to core to return all org-wide role assignments (no site, site group, or legal entity target).',
    }),
    ApiParam({ name: 'orgId', type: String, description: 'Organization ID' }),
    ApiResponse({ status: 200, description: 'Role assignments retrieved successfully.', type: [RoleAssignmentDto] }),
    ApiResponse({ status: 404, description: 'Organization or deployment not found.' }),
    ApiResponse({ status: 503, description: 'Deployment unreachable.' }),
  );
}

export function ApiAssignOrgRole() {
  return applyDecorators(
    ApiOperation({
      summary: 'Assign a role org-wide',
      description: 'Proxies to core to assign a role to a user across the whole organization.',
    }),
    ApiParam({ name: 'orgId', type: String, description: 'Organization ID' }),
    ApiBody({ type: AssignRoleDto }),
    ApiResponse({ status: 201, description: 'Role assigned successfully.', type: CreateResponseDto }),
    ApiResponse({ status: 400, description: 'Validation failed.' }),
    ApiResponse({ status: 404, description: 'Organization, deployment, user, or role not found.' }),
    ApiResponse({ status: 503, description: 'Deployment unreachable.' }),
  );
}

export function ApiRemoveOrgRoleAssignment() {
  return applyDecorators(
    ApiOperation({
      summary: 'Remove an org-wide role assignment',
      description: 'Proxies to core to remove an org-wide role assignment.',
    }),
    ApiParam({ name: 'orgId', type: String, description: 'Organization ID' }),
    ApiParam({ name: 'assignmentId', type: String, description: 'Role assignment ID' }),
    ApiResponse({ status: 200, description: 'Role assignment removed successfully.' }),
    ApiResponse({ status: 404, description: 'Organization, deployment, or assignment not found.' }),
    ApiResponse({ status: 503, description: 'Deployment unreachable.' }),
  );
}

export function ApiGetOrgCompatibleRoles() {
  return applyDecorators(
    ApiOperation({
      summary: 'Get org-wide compatible roles',
      description:
        'Proxies to core to return roles assignable org-wide — ORG-scoped templates, SITE-scoped templates, and custom roles.',
    }),
    ApiParam({ name: 'orgId', type: String, description: 'Organization ID' }),
    ApiResponse({ status: 200, description: 'Roles retrieved successfully.', type: [CoreRoleDto] }),
    ApiResponse({ status: 404, description: 'Organization or deployment not found.' }),
    ApiResponse({ status: 503, description: 'Deployment unreachable.' }),
  );
}
