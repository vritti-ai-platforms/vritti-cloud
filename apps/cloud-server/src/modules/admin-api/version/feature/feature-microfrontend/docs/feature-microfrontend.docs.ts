import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { SuccessResponseDto } from '@vritti/api-sdk';
import { FeatureMicrofrontendDto } from '../dto/entity/feature-microfrontend.dto';
import { SetFeatureMicrofrontendDto } from '../dto/request/set-feature-microfrontend.dto';

// Swagger docs for listing microfrontend links for a feature
export function ApiListFeatureMicrofrontends() {
  return applyDecorators(
    ApiOperation({ summary: 'List microfrontend links for a feature' }),
    ApiParam({ name: 'featureId', description: 'Feature UUID', example: '550e8400-e29b-41d4-a716-446655440000' }),
    ApiResponse({ status: 200, description: 'Feature microfrontend links retrieved successfully.', type: [FeatureMicrofrontendDto] }),
    ApiResponse({ status: 401, description: 'Unauthorized.' }),
    ApiResponse({ status: 404, description: 'Feature not found.' }),
  );
}

// Swagger docs for setting a microfrontend link on a feature
export function ApiSetFeatureMicrofrontend() {
  return applyDecorators(
    ApiOperation({ summary: 'Set or update a microfrontend link for a feature' }),
    ApiParam({ name: 'featureId', description: 'Feature UUID', example: '550e8400-e29b-41d4-a716-446655440000' }),
    ApiParam({ name: 'microfrontendId', description: 'Microfrontend UUID', example: '550e8400-e29b-41d4-a716-446655440000' }),
    ApiBody({ type: SetFeatureMicrofrontendDto }),
    ApiResponse({ status: 200, description: 'Feature microfrontend link set successfully.', type: FeatureMicrofrontendDto }),
    ApiResponse({ status: 400, description: 'Validation failed.' }),
    ApiResponse({ status: 401, description: 'Unauthorized.' }),
    ApiResponse({ status: 404, description: 'Feature or microfrontend not found.' }),
  );
}

// Swagger docs for removing a microfrontend link from a feature
export function ApiRemoveFeatureMicrofrontend() {
  return applyDecorators(
    ApiOperation({ summary: 'Remove a microfrontend link from a feature' }),
    ApiParam({ name: 'featureId', description: 'Feature UUID', example: '550e8400-e29b-41d4-a716-446655440000' }),
    ApiParam({ name: 'microfrontendId', description: 'Microfrontend UUID', example: '550e8400-e29b-41d4-a716-446655440000' }),
    ApiResponse({ status: 200, description: 'Feature microfrontend link removed successfully.', type: SuccessResponseDto }),
    ApiResponse({ status: 401, description: 'Unauthorized.' }),
    ApiResponse({ status: 404, description: 'Feature or microfrontend link not found.' }),
  );
}
