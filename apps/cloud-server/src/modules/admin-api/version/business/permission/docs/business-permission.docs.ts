import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { BusinessPermissionTableResponseDto } from '../dto/response/business-permission-table-response.dto';

// Swagger docs for listing the permissions visible to a business in a data table
export function ApiFindForTableBusinessPermissions() {
  return applyDecorators(
    ApiOperation({ summary: 'List permissions visible to a business (global or linked), with server-stored state' }),
    ApiParam({ name: 'versionId', description: 'Version UUID', example: '550e8400-e29b-41d4-a716-446655440000' }),
    ApiParam({ name: 'businessId', description: 'Business UUID', example: '550e8400-e29b-41d4-a716-446655440001' }),
    ApiQuery({ name: 'featureId', required: false, description: 'Filter by feature' }),
    ApiResponse({
      status: 200,
      description: 'Permissions retrieved successfully.',
      type: BusinessPermissionTableResponseDto,
    }),
    ApiResponse({ status: 401, description: 'Unauthorized.' }),
  );
}
