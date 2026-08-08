import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { SuccessResponseDto } from '@vritti/api-sdk/database';
import { OrganizationDetailDto } from '../dto/entity/organization-detail.dto';
import { OrganizationTableResponseDto } from '../dto/response/organizations-response.dto';

export function ApiFindForTableOrganizations() {
  return applyDecorators(
    ApiOperation({ summary: 'List organizations for data table (server-stored state)' }),
    ApiResponse({
      status: 200,
      description: 'Organizations retrieved successfully.',
      type: OrganizationTableResponseDto,
    }),
    ApiResponse({ status: 401, description: 'Unauthorized.' }),
  );
}

export function ApiFindOrganizationById() {
  return applyDecorators(
    ApiOperation({ summary: 'Get an organization by ID' }),
    ApiParam({ name: 'id', description: 'Organization UUID', example: '550e8400-e29b-41d4-a716-446655440000' }),
    ApiResponse({ status: 200, description: 'Organization retrieved successfully.', type: OrganizationDetailDto }),
    ApiResponse({ status: 401, description: 'Unauthorized.' }),
    ApiResponse({ status: 404, description: 'Organization not found.' }),
  );
}

export function ApiSyncOrgFeatures() {
  return applyDecorators(
    ApiOperation({
      summary: "Sync the organization's features",
      description: 'Re-pushes the role templates and entitlement for this org (no catalog, no other orgs).',
    }),
    ApiParam({ name: 'id', description: 'Organization UUID', example: '550e8400-e29b-41d4-a716-446655440000' }),
    ApiResponse({ status: 200, description: 'Organization features synced successfully.', type: SuccessResponseDto }),
    ApiResponse({ status: 401, description: 'Unauthorized.' }),
    ApiResponse({ status: 404, description: 'Organization not found.' }),
  );
}

export function ApiRotateOrgStorage() {
  return applyDecorators(
    ApiOperation({
      summary: 'Rotate storage credential',
      description:
        "Mints a fresh key scoped to the organization's existing buckets, hands it to core, then revokes the old " +
        'one. Object storage stays reachable throughout — nothing is revoked until the replacement is in place.',
    }),
    ApiParam({ name: 'id', type: String, description: 'Organization ID' }),
    ApiResponse({ status: 200, description: 'Credential rotated.', type: SuccessResponseDto }),
    ApiResponse({ status: 400, description: 'Organization has no provisioned storage.' }),
    ApiResponse({ status: 404, description: 'Organization not found.' }),
  );
}

export function ApiDeleteOrganization() {
  return applyDecorators(
    ApiOperation({
      summary: 'Delete an organization',
      description:
        'Removes the organization from core and cloud, empties and deletes its buckets, and revokes its storage ' +
        'credential. Irreversible.',
    }),
    ApiParam({ name: 'id', type: String, description: 'Organization ID' }),
    ApiResponse({ status: 200, description: 'Organization deleted.', type: SuccessResponseDto }),
    ApiResponse({ status: 404, description: 'Organization not found.' }),
  );
}
