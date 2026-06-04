import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

export function ApiGetPermissionTypes() {
  return applyDecorators(
    ApiOperation({ summary: 'Get permission types', description: 'Returns all available feature permission types from the enum.' }),
    ApiResponse({ status: 200, description: 'Permission types retrieved successfully.' }),
  );
}
