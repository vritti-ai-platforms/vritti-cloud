import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CloudBusinessDto } from '../dto/entity/business.dto';
import { BusinessSelectResponseDto } from '../dto/response/business-select-response.dto';

export function ApiGetBusinesses() {
  return applyDecorators(
    ApiOperation({ summary: 'Get all businesses', description: 'Returns a list of all available business types.' }),
    ApiResponse({ status: 200, description: 'Businesses retrieved successfully.', type: CloudBusinessDto, isArray: true }),
  );
}

export function ApiGetBusinessesSelect() {
  return applyDecorators(
    ApiOperation({
      summary: 'Get businesses for select component',
      description: 'Returns paginated business options for quantum-ui Select.',
    }),
    ApiResponse({ status: 200, description: 'Business options retrieved.', type: BusinessSelectResponseDto }),
  );
}
