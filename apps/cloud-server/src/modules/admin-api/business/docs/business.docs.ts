import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { SuccessResponseDto } from '@vritti/api-sdk';
import { BusinessDto } from '../dto/entity/business.dto';
import { CreateBusinessDto } from '../dto/request/create-business.dto';
import { UpdateBusinessDto } from '../dto/request/update-business.dto';
import { BusinessTableResponseDto } from '../dto/response/businesses-response.dto';

export function ApiCreateBusiness() {
  return applyDecorators(
    ApiOperation({ summary: 'Create a new business' }),
    ApiBody({ type: CreateBusinessDto }),
    ApiResponse({ status: 201, description: 'Business created successfully.', type: BusinessDto }),
    ApiResponse({ status: 400, description: 'Validation failed.' }),
    ApiResponse({ status: 401, description: 'Unauthorized.' }),
    ApiResponse({ status: 409, description: 'Business with this code or slug already exists.' }),
  );
}

export function ApiFindForTableBusinesses() {
  return applyDecorators(
    ApiOperation({ summary: 'List businesses for data table (server-stored state)' }),
    ApiResponse({ status: 200, description: 'Businesses retrieved successfully.', type: BusinessTableResponseDto }),
    ApiResponse({ status: 401, description: 'Unauthorized.' }),
  );
}

export function ApiUpdateBusiness() {
  return applyDecorators(
    ApiOperation({ summary: 'Update a business' }),
    ApiParam({ name: 'id', description: 'Business UUID', example: '550e8400-e29b-41d4-a716-446655440000' }),
    ApiBody({ type: UpdateBusinessDto }),
    ApiResponse({ status: 200, description: 'Business updated successfully.', type: SuccessResponseDto }),
    ApiResponse({ status: 400, description: 'Validation failed.' }),
    ApiResponse({ status: 401, description: 'Unauthorized.' }),
    ApiResponse({ status: 404, description: 'Business not found.' }),
    ApiResponse({ status: 409, description: 'Business with this code or slug already exists.' }),
  );
}

export function ApiDeleteBusiness() {
  return applyDecorators(
    ApiOperation({ summary: 'Delete a business' }),
    ApiParam({ name: 'id', description: 'Business UUID', example: '550e8400-e29b-41d4-a716-446655440000' }),
    ApiResponse({ status: 200, description: 'Business deleted successfully.', type: SuccessResponseDto }),
    ApiResponse({ status: 401, description: 'Unauthorized.' }),
    ApiResponse({ status: 404, description: 'Business not found.' }),
  );
}
