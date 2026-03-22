import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';

export function ApiListBusinessUnits() {
  return applyDecorators(
    ApiOperation({
      summary: 'List organization business units',
      description: 'Proxies to core to return all business units for the organization.',
    }),
    ApiParam({ name: 'orgId', type: String, description: 'Organization ID' }),
    ApiResponse({ status: 200, description: 'Business units retrieved successfully.' }),
    ApiResponse({ status: 401, description: 'Unauthorized.' }),
    ApiResponse({ status: 404, description: 'Organization or deployment not found.' }),
    ApiResponse({ status: 503, description: 'Deployment unreachable.' }),
  );
}

export function ApiCreateBusinessUnit() {
  return applyDecorators(
    ApiOperation({
      summary: 'Create a business unit',
      description: 'Proxies to core to create a new business unit. Checks plan limits before creating.',
    }),
    ApiParam({ name: 'orgId', type: String, description: 'Organization ID' }),
    ApiResponse({ status: 201, description: 'Business unit created successfully.' }),
    ApiResponse({ status: 400, description: 'Validation failed.' }),
    ApiResponse({ status: 403, description: 'Business unit limit reached for the plan.' }),
    ApiResponse({ status: 404, description: 'Organization or deployment not found.' }),
    ApiResponse({ status: 503, description: 'Deployment unreachable.' }),
  );
}

export function ApiGetBusinessUnit() {
  return applyDecorators(
    ApiOperation({
      summary: 'Get a business unit',
      description: 'Proxies to core to return a single business unit by ID.',
    }),
    ApiParam({ name: 'orgId', type: String, description: 'Organization ID' }),
    ApiParam({ name: 'buId', type: String, description: 'Business unit ID' }),
    ApiResponse({ status: 200, description: 'Business unit retrieved successfully.' }),
    ApiResponse({ status: 404, description: 'Organization, deployment, or business unit not found.' }),
    ApiResponse({ status: 503, description: 'Deployment unreachable.' }),
  );
}

export function ApiUpdateBusinessUnit() {
  return applyDecorators(
    ApiOperation({
      summary: 'Update a business unit',
      description: 'Proxies to core to update a business unit.',
    }),
    ApiParam({ name: 'orgId', type: String, description: 'Organization ID' }),
    ApiParam({ name: 'buId', type: String, description: 'Business unit ID' }),
    ApiResponse({ status: 200, description: 'Business unit updated successfully.' }),
    ApiResponse({ status: 400, description: 'Validation failed.' }),
    ApiResponse({ status: 404, description: 'Organization, deployment, or business unit not found.' }),
    ApiResponse({ status: 503, description: 'Deployment unreachable.' }),
  );
}

export function ApiDeleteBusinessUnit() {
  return applyDecorators(
    ApiOperation({
      summary: 'Delete a business unit',
      description: 'Proxies to core to delete a business unit.',
    }),
    ApiParam({ name: 'orgId', type: String, description: 'Organization ID' }),
    ApiParam({ name: 'buId', type: String, description: 'Business unit ID' }),
    ApiResponse({ status: 200, description: 'Business unit deleted successfully.' }),
    ApiResponse({ status: 404, description: 'Organization, deployment, or business unit not found.' }),
    ApiResponse({ status: 503, description: 'Deployment unreachable.' }),
  );
}
