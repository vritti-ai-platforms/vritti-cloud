import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { SuccessResponseDto } from '@vritti/api-sdk';
import { IndustryAppDto } from '../dto/entity/industry-app.dto';
import { AssignIndustryAppDto } from '../dto/request/assign-industry-app.dto';
import { UpdateIndustryAppDto } from '../dto/request/update-industry-app.dto';

// Swagger docs for listing apps assigned to an industry
export function ApiGetIndustryApps() {
  return applyDecorators(
    ApiOperation({ summary: 'List apps assigned to an industry' }),
    ApiParam({ name: 'industryId', description: 'Industry UUID', example: '550e8400-e29b-41d4-a716-446655440000' }),
    ApiResponse({ status: 200, description: 'Industry apps retrieved successfully.', type: [IndustryAppDto] }),
    ApiResponse({ status: 401, description: 'Unauthorized.' }),
    ApiResponse({ status: 404, description: 'Industry not found.' }),
  );
}

// Swagger docs for assigning an app to an industry
export function ApiAssignIndustryApp() {
  return applyDecorators(
    ApiOperation({ summary: 'Assign an app to an industry' }),
    ApiParam({ name: 'industryId', description: 'Industry UUID', example: '550e8400-e29b-41d4-a716-446655440000' }),
    ApiBody({ type: AssignIndustryAppDto }),
    ApiResponse({ status: 201, description: 'App assigned to industry successfully.', type: IndustryAppDto }),
    ApiResponse({ status: 400, description: 'Validation failed.' }),
    ApiResponse({ status: 401, description: 'Unauthorized.' }),
    ApiResponse({ status: 404, description: 'Industry or app not found.' }),
    ApiResponse({ status: 409, description: 'App already assigned to this industry.' }),
  );
}

// Swagger docs for updating an industry-app assignment
export function ApiUpdateIndustryApp() {
  return applyDecorators(
    ApiOperation({ summary: 'Update an industry-app assignment' }),
    ApiParam({ name: 'industryId', description: 'Industry UUID', example: '550e8400-e29b-41d4-a716-446655440000' }),
    ApiParam({ name: 'appId', description: 'App UUID', example: '550e8400-e29b-41d4-a716-446655440000' }),
    ApiBody({ type: UpdateIndustryAppDto }),
    ApiResponse({ status: 200, description: 'Industry app updated successfully.', type: SuccessResponseDto }),
    ApiResponse({ status: 400, description: 'Validation failed.' }),
    ApiResponse({ status: 401, description: 'Unauthorized.' }),
    ApiResponse({ status: 404, description: 'Industry or industry-app assignment not found.' }),
  );
}

// Swagger docs for removing an app from an industry
export function ApiRemoveIndustryApp() {
  return applyDecorators(
    ApiOperation({ summary: 'Remove an app from an industry' }),
    ApiParam({ name: 'industryId', description: 'Industry UUID', example: '550e8400-e29b-41d4-a716-446655440000' }),
    ApiParam({ name: 'appId', description: 'App UUID', example: '550e8400-e29b-41d4-a716-446655440000' }),
    ApiResponse({ status: 200, description: 'App removed from industry successfully.', type: SuccessResponseDto }),
    ApiResponse({ status: 401, description: 'Unauthorized.' }),
    ApiResponse({ status: 404, description: 'Industry or industry-app assignment not found.' }),
  );
}
