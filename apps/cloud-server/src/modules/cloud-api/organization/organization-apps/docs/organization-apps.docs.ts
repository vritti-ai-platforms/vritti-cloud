import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { SuccessResponseDto } from '@vritti/api-sdk';
import { PurchaseAddonDto } from '../dto/request/purchase-addon.dto';
import {
  OrgAppListResponseDto,
  OrgPermissionsResponseDto,
} from '../dto/response/org-app-list.response.dto';

export function ApiListOrgApps() {
  return applyDecorators(
    ApiOperation({
      summary: 'List organization apps',
      description: 'Returns all catalog apps with status: included, addon, unavailable, or enabled.',
    }),
    ApiParam({ name: 'orgId', type: String, description: 'Organization ID' }),
    ApiResponse({ status: 200, description: 'App list retrieved successfully.', type: OrgAppListResponseDto }),
    ApiResponse({ status: 401, description: 'Unauthorized.' }),
    ApiResponse({ status: 404, description: 'Organization or deployment not found.' }),
  );
}

export function ApiEnableApp() {
  return applyDecorators(
    ApiOperation({
      summary: 'Enable a plan-included app',
      description: 'Enables a plan-included app for the organization by pushing configuration to core.',
    }),
    ApiParam({ name: 'orgId', type: String, description: 'Organization ID' }),
    ApiParam({ name: 'appId', type: String, description: 'App ID to enable' }),
    ApiResponse({ status: 200, description: 'App enabled successfully.', type: SuccessResponseDto }),
    ApiResponse({ status: 403, description: 'App not included in the organization plan.' }),
    ApiResponse({ status: 404, description: 'Organization, deployment, or app not found.' }),
    ApiResponse({ status: 503, description: 'Deployment unreachable.' }),
  );
}

export function ApiDisableApp() {
  return applyDecorators(
    ApiOperation({
      summary: 'Disable an app',
      description: 'Disables an app for the organization by notifying core.',
    }),
    ApiParam({ name: 'orgId', type: String, description: 'Organization ID' }),
    ApiParam({ name: 'appId', type: String, description: 'App ID to disable' }),
    ApiResponse({ status: 200, description: 'App disabled successfully.', type: SuccessResponseDto }),
    ApiResponse({ status: 404, description: 'Organization, deployment, or app not found.' }),
    ApiResponse({ status: 503, description: 'Deployment unreachable.' }),
  );
}

export function ApiPurchaseAddon() {
  return applyDecorators(
    ApiOperation({
      summary: 'Purchase an addon app',
      description: 'Purchases an addon app for specific business units and provisions it in core.',
    }),
    ApiParam({ name: 'orgId', type: String, description: 'Organization ID' }),
    ApiParam({ name: 'appId', type: String, description: 'Addon app ID' }),
    ApiBody({ type: PurchaseAddonDto }),
    ApiResponse({ status: 201, description: 'Addon purchased successfully.', type: SuccessResponseDto }),
    ApiResponse({ status: 403, description: 'App is plan-included or addon not available in region.' }),
    ApiResponse({ status: 404, description: 'Organization, deployment, or app not found.' }),
    ApiResponse({ status: 503, description: 'Deployment unreachable.' }),
  );
}

export function ApiCancelAddon() {
  return applyDecorators(
    ApiOperation({
      summary: 'Cancel an addon for a business unit',
      description: 'Cancels an addon app for a specific business unit in core.',
    }),
    ApiParam({ name: 'orgId', type: String, description: 'Organization ID' }),
    ApiParam({ name: 'appId', type: String, description: 'Addon app ID' }),
    ApiParam({ name: 'businessUnitId', type: String, description: 'Business unit ID' }),
    ApiResponse({ status: 200, description: 'Addon cancelled successfully.', type: SuccessResponseDto }),
    ApiResponse({ status: 404, description: 'Organization, deployment, or app not found.' }),
    ApiResponse({ status: 503, description: 'Deployment unreachable.' }),
  );
}

export function ApiGetOrgPermissions() {
  return applyDecorators(
    ApiOperation({
      summary: 'List organization permissions',
      description: 'Returns all features grouped by app for the organization, used for building role permission forms.',
    }),
    ApiParam({ name: 'orgId', type: String, description: 'Organization ID' }),
    ApiResponse({ status: 200, description: 'Permissions retrieved successfully.', type: OrgPermissionsResponseDto }),
    ApiResponse({ status: 404, description: 'Organization not found.' }),
  );
}
