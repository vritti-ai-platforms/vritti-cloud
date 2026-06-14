import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CloudBusinessDto } from '../dto/entity/business.dto';

export function ApiGetBusinesses() {
  return applyDecorators(
    ApiOperation({ summary: 'Get all businesses', description: 'Returns a list of all available business types.' }),
    ApiResponse({
      status: 200,
      description: 'Businesses retrieved successfully.',
      type: CloudBusinessDto,
      isArray: true,
    }),
  );
}
