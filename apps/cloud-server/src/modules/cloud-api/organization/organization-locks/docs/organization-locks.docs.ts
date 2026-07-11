import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { SetLocksDto } from '../../dto/request/set-locks.dto';
import { SiteMatrixResponseDto } from '../../dto/response/site-matrix.response.dto';

export function ApiGetOrgLocks() {
  return applyDecorators(
    ApiOperation({
      summary: 'Get organization lock matrix',
      description:
        "Returns the ORG-scope permission matrix built from the version snapshot — the plan ceiling minus the organization's lock deny-list stored in core.",
    }),
    ApiParam({ name: 'orgId', type: String, description: 'Organization ID' }),
    ApiResponse({ status: 200, description: 'Matrix retrieved successfully.', type: SiteMatrixResponseDto }),
    ApiResponse({ status: 404, description: 'Organization, deployment, or plan not found.' }),
  );
}

export function ApiUpdateOrgLocks() {
  return applyDecorators(
    ApiOperation({
      summary: 'Replace organization locks',
      description:
        "Replaces the organization's ORG-scope lock deny-list (featureCode → { web?, mobile? }; platform null locks the whole feature) in core. Locks on out-of-plan codes are inert — the plan remains the ceiling.",
    }),
    ApiParam({ name: 'orgId', type: String, description: 'Organization ID' }),
    ApiBody({ type: SetLocksDto }),
    ApiResponse({ status: 200, description: 'Organization permissions updated successfully.' }),
    ApiResponse({ status: 400, description: 'Invalid lock shape.' }),
    ApiResponse({ status: 404, description: 'Organization or deployment not found.' }),
    ApiResponse({ status: 503, description: 'Deployment unreachable.' }),
  );
}

export function ApiGetLegalEntityLocks() {
  return applyDecorators(
    ApiOperation({
      summary: 'Get legal entity lock matrix',
      description:
        "Returns the LE-scope permission matrix built from the version snapshot — the plan ceiling minus the legal entity's lock deny-list stored in core.",
    }),
    ApiParam({ name: 'orgId', type: String, description: 'Organization ID' }),
    ApiParam({ name: 'leId', type: String, description: 'Legal entity ID' }),
    ApiResponse({ status: 200, description: 'Matrix retrieved successfully.', type: SiteMatrixResponseDto }),
    ApiResponse({ status: 404, description: 'Organization, deployment, plan, or legal entity not found.' }),
  );
}

export function ApiUpdateLegalEntityLocks() {
  return applyDecorators(
    ApiOperation({
      summary: 'Replace legal entity locks',
      description:
        "Replaces the legal entity's LE-scope lock deny-list (featureCode → { web?, mobile? }; platform null locks the whole feature) in core. Locks on out-of-plan codes are inert — the plan remains the ceiling.",
    }),
    ApiParam({ name: 'orgId', type: String, description: 'Organization ID' }),
    ApiParam({ name: 'leId', type: String, description: 'Legal entity ID' }),
    ApiBody({ type: SetLocksDto }),
    ApiResponse({ status: 200, description: 'Legal entity permissions updated successfully.' }),
    ApiResponse({ status: 400, description: 'Invalid lock shape.' }),
    ApiResponse({ status: 404, description: 'Organization, deployment, or legal entity not found.' }),
    ApiResponse({ status: 503, description: 'Deployment unreachable.' }),
  );
}

export function ApiGetSiteGroupLocks() {
  return applyDecorators(
    ApiOperation({
      summary: 'Get site group lock matrix',
      description:
        "Returns the SITE_GROUP-scope permission matrix built from the version snapshot — the plan ceiling minus the site group's lock deny-list stored in core.",
    }),
    ApiParam({ name: 'orgId', type: String, description: 'Organization ID' }),
    ApiParam({ name: 'groupId', type: String, description: 'Site group ID' }),
    ApiResponse({ status: 200, description: 'Matrix retrieved successfully.', type: SiteMatrixResponseDto }),
    ApiResponse({ status: 404, description: 'Organization, deployment, plan, or site group not found.' }),
  );
}

export function ApiUpdateSiteGroupLocks() {
  return applyDecorators(
    ApiOperation({
      summary: 'Replace site group locks',
      description:
        "Replaces the site group's SITE_GROUP-scope lock deny-list (featureCode → { web?, mobile? }; platform null locks the whole feature) in core. Locks on out-of-plan codes are inert — the plan remains the ceiling.",
    }),
    ApiParam({ name: 'orgId', type: String, description: 'Organization ID' }),
    ApiParam({ name: 'groupId', type: String, description: 'Site group ID' }),
    ApiBody({ type: SetLocksDto }),
    ApiResponse({ status: 200, description: 'Site group permissions updated successfully.' }),
    ApiResponse({ status: 400, description: 'Invalid lock shape.' }),
    ApiResponse({ status: 404, description: 'Organization, deployment, or site group not found.' }),
    ApiResponse({ status: 503, description: 'Deployment unreachable.' }),
  );
}
