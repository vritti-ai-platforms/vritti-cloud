import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { SuccessResponseDto } from '@vritti/api-sdk';
import { PlanPriceDto } from '../dto/entity/plan-price.dto';
import { CreatePlanPricesDto } from '../dto/request/create-plan-prices.dto';
import { UpdatePlanPriceAmountDto } from '../dto/request/update-plan-price-amount.dto';

// Swagger docs for listing plan prices
export function ApiListPlanPrices() {
  return applyDecorators(
    ApiOperation({ summary: 'List all prices for a plan across countries and billing cycles' }),
    ApiParam({ name: 'versionId', description: 'Version UUID', example: '550e8400-e29b-41d4-a716-446655440000' }),
    ApiParam({ name: 'businessId', description: 'Business UUID', example: '550e8400-e29b-41d4-a716-446655440000' }),
    ApiParam({ name: 'planId', description: 'Plan UUID', example: '550e8400-e29b-41d4-a716-446655440000' }),
    ApiResponse({ status: 200, description: 'Plan prices retrieved successfully.', type: [PlanPriceDto] }),
    ApiResponse({ status: 401, description: 'Unauthorized.' }),
  );
}

// Swagger docs for creating a batch of prices for a plan + country
export function ApiCreatePlanPrices() {
  return applyDecorators(
    ApiOperation({ summary: 'Create or update prices for a plan + country across billing cycles' }),
    ApiParam({ name: 'versionId', description: 'Version UUID', example: '550e8400-e29b-41d4-a716-446655440000' }),
    ApiParam({ name: 'businessId', description: 'Business UUID', example: '550e8400-e29b-41d4-a716-446655440000' }),
    ApiParam({ name: 'planId', description: 'Plan UUID', example: '550e8400-e29b-41d4-a716-446655440000' }),
    ApiBody({ type: CreatePlanPricesDto }),
    ApiResponse({ status: 200, description: 'Plan prices saved successfully.', type: SuccessResponseDto }),
    ApiResponse({ status: 400, description: 'Validation failed.' }),
    ApiResponse({ status: 401, description: 'Unauthorized.' }),
    ApiResponse({ status: 404, description: 'Plan not found.' }),
  );
}

// Swagger docs for updating a single price amount
export function ApiUpdatePlanPriceAmount() {
  return applyDecorators(
    ApiOperation({ summary: 'Update the amount on a single plan price' }),
    ApiParam({ name: 'versionId', description: 'Version UUID', example: '550e8400-e29b-41d4-a716-446655440000' }),
    ApiParam({ name: 'businessId', description: 'Business UUID', example: '550e8400-e29b-41d4-a716-446655440000' }),
    ApiParam({ name: 'planId', description: 'Plan UUID', example: '550e8400-e29b-41d4-a716-446655440000' }),
    ApiParam({ name: 'priceId', description: 'Plan Price UUID', example: '550e8400-e29b-41d4-a716-446655440000' }),
    ApiBody({ type: UpdatePlanPriceAmountDto }),
    ApiResponse({ status: 200, description: 'Plan price updated successfully.', type: SuccessResponseDto }),
    ApiResponse({ status: 400, description: 'Validation failed.' }),
    ApiResponse({ status: 401, description: 'Unauthorized.' }),
    ApiResponse({ status: 404, description: 'Plan price not found.' }),
  );
}

// Swagger docs for deleting a single price
export function ApiDeletePlanPrice() {
  return applyDecorators(
    ApiOperation({ summary: 'Delete a single plan price' }),
    ApiParam({ name: 'versionId', description: 'Version UUID', example: '550e8400-e29b-41d4-a716-446655440000' }),
    ApiParam({ name: 'businessId', description: 'Business UUID', example: '550e8400-e29b-41d4-a716-446655440000' }),
    ApiParam({ name: 'planId', description: 'Plan UUID', example: '550e8400-e29b-41d4-a716-446655440000' }),
    ApiParam({ name: 'priceId', description: 'Plan Price UUID', example: '550e8400-e29b-41d4-a716-446655440000' }),
    ApiResponse({ status: 200, description: 'Plan price deleted successfully.', type: SuccessResponseDto }),
    ApiResponse({ status: 401, description: 'Unauthorized.' }),
    ApiResponse({ status: 404, description: 'Plan price not found.' }),
  );
}
