import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { SuccessResponseDto } from '@vritti/api-sdk';
import { FeaturePermissionDto } from '@/modules/admin-api/version/permission/dto/entity/feature-permission.dto';

// Swagger docs for listing the permissions owned by a feature
export function ApiListFeaturePermissions() {
  return applyDecorators(
    ApiOperation({ summary: 'List permissions owned by a feature, in display order' }),
    ApiParam({ name: 'versionId', description: 'Version UUID', example: '550e8400-e29b-41d4-a716-446655440000' }),
    ApiParam({ name: 'featureId', description: 'Feature UUID', example: '550e8400-e29b-41d4-a716-446655440001' }),
    ApiResponse({
      status: 200,
      description: 'Permissions retrieved successfully.',
      type: [FeaturePermissionDto],
    }),
    ApiResponse({ status: 401, description: 'Unauthorized.' }),
  );
}

// Swagger docs for reordering the permissions owned by a feature
export function ApiReorderPermissions() {
  return applyDecorators(
    ApiOperation({ summary: 'Reorder the permissions owned by a feature' }),
    ApiParam({ name: 'versionId', description: 'Version UUID', example: '550e8400-e29b-41d4-a716-446655440000' }),
    ApiParam({ name: 'featureId', description: 'Feature UUID', example: '550e8400-e29b-41d4-a716-446655440001' }),
    ApiResponse({
      status: 200,
      description: 'Permissions reordered successfully.',
      type: SuccessResponseDto,
    }),
    ApiResponse({ status: 400, description: 'One or more permissions do not belong to this feature.' }),
    ApiResponse({ status: 401, description: 'Unauthorized.' }),
  );
}
