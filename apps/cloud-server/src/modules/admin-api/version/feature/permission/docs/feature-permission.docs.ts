import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { FeaturePermissionTableResponseDto } from '@/modules/admin-api/version/permission/dto/response/feature-permission-table-response.dto';

// Swagger docs for listing the permissions owned by a feature in a data table
export function ApiFindForTableFeaturePermissions() {
  return applyDecorators(
    ApiOperation({ summary: 'List permissions owned by a feature, with server-stored state' }),
    ApiParam({ name: 'versionId', description: 'Version UUID', example: '550e8400-e29b-41d4-a716-446655440000' }),
    ApiParam({ name: 'featureId', description: 'Feature UUID', example: '550e8400-e29b-41d4-a716-446655440001' }),
    ApiResponse({
      status: 200,
      description: 'Permissions retrieved successfully.',
      type: FeaturePermissionTableResponseDto,
    }),
    ApiResponse({ status: 401, description: 'Unauthorized.' }),
  );
}
