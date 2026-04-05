import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { SuccessResponseDto } from '@vritti/api-sdk';
import { AppPriceDto } from '../dto/entity/app-price.dto';
import { CreateAppPriceDto } from '../dto/request/create-app-price.dto';

// Swagger docs for listing addon prices for an app
export function ApiListAppPrices() {
  return applyDecorators(
    ApiOperation({ summary: 'List addon prices for an app' }),
    ApiParam({ name: 'appId', description: 'App UUID', example: '550e8400-e29b-41d4-a716-446655440000' }),
    ApiResponse({ status: 200, description: 'Prices retrieved successfully.', type: [AppPriceDto] }),
    ApiResponse({ status: 401, description: 'Unauthorized.' }),
    ApiResponse({ status: 404, description: 'App not found.' }),
  );
}

// Swagger docs for creating an addon price
export function ApiCreateAppPrice() {
  return applyDecorators(
    ApiOperation({ summary: 'Create addon price for region + provider' }),
    ApiParam({ name: 'appId', description: 'App UUID', example: '550e8400-e29b-41d4-a716-446655440000' }),
    ApiBody({ type: CreateAppPriceDto }),
    ApiResponse({ status: 201, description: 'App price created successfully.', type: AppPriceDto }),
    ApiResponse({ status: 400, description: 'Validation failed.' }),
    ApiResponse({ status: 401, description: 'Unauthorized.' }),
    ApiResponse({ status: 404, description: 'App not found.' }),
    ApiResponse({ status: 409, description: 'Price for this region and provider already exists.' }),
  );
}

// Swagger docs for updating an addon price
export function ApiUpdateAppPrice() {
  return applyDecorators(
    ApiOperation({ summary: 'Update an addon price' }),
    ApiParam({ name: 'appId', description: 'App UUID', example: '550e8400-e29b-41d4-a716-446655440000' }),
    ApiParam({ name: 'priceId', description: 'Price UUID', example: '550e8400-e29b-41d4-a716-446655440000' }),
    ApiBody({ type: CreateAppPriceDto }),
    ApiResponse({ status: 200, description: 'App price updated successfully.', type: SuccessResponseDto }),
    ApiResponse({ status: 400, description: 'Validation failed.' }),
    ApiResponse({ status: 401, description: 'Unauthorized.' }),
    ApiResponse({ status: 404, description: 'App price not found.' }),
  );
}

// Swagger docs for deleting an addon price
export function ApiDeleteAppPrice() {
  return applyDecorators(
    ApiOperation({ summary: 'Delete an addon price' }),
    ApiParam({ name: 'appId', description: 'App UUID', example: '550e8400-e29b-41d4-a716-446655440000' }),
    ApiParam({ name: 'priceId', description: 'Price UUID', example: '550e8400-e29b-41d4-a716-446655440000' }),
    ApiResponse({ status: 200, description: 'App price deleted successfully.', type: SuccessResponseDto }),
    ApiResponse({ status: 401, description: 'Unauthorized.' }),
    ApiResponse({ status: 404, description: 'App price not found.' }),
  );
}
