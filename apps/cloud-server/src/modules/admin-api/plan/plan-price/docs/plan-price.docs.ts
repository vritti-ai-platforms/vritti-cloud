import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { SuccessResponseDto } from '@vritti/api-sdk';
import { PlanPriceDto } from '../dto/entity/plan-price.dto';
import { UpsertPlanPriceDto } from '../dto/request/upsert-plan-price.dto';

// Swagger docs for listing plan prices
export function ApiListPlanPrices() {
  return applyDecorators(
    ApiOperation({ summary: 'List prices for a plan across countries and billing periods' }),
    ApiParam({ name: 'planId', description: 'Plan UUID', example: '550e8400-e29b-41d4-a716-446655440000' }),
    ApiResponse({ status: 200, description: 'Plan prices retrieved successfully.', type: [PlanPriceDto] }),
    ApiResponse({ status: 401, description: 'Unauthorized.' }),
    ApiResponse({ status: 404, description: 'Plan not found.' }),
  );
}

// Swagger docs for upserting a plan price
export function ApiUpsertPlanPrice() {
  return applyDecorators(
    ApiOperation({ summary: 'Create or update a plan price for a country + billing period' }),
    ApiParam({ name: 'planId', description: 'Plan UUID', example: '550e8400-e29b-41d4-a716-446655440000' }),
    ApiBody({ type: UpsertPlanPriceDto }),
    ApiResponse({ status: 200, description: 'Plan price saved successfully.', type: PlanPriceDto }),
    ApiResponse({ status: 400, description: 'Validation failed.' }),
    ApiResponse({ status: 401, description: 'Unauthorized.' }),
    ApiResponse({ status: 404, description: 'Plan not found.' }),
  );
}

// Swagger docs for deleting a plan price
export function ApiDeletePlanPrice() {
  return applyDecorators(
    ApiOperation({ summary: 'Delete a plan price for a country + billing period' }),
    ApiParam({ name: 'planId', description: 'Plan UUID', example: '550e8400-e29b-41d4-a716-446655440000' }),
    ApiBody({ type: UpsertPlanPriceDto }),
    ApiResponse({ status: 200, description: 'Plan price deleted successfully.', type: SuccessResponseDto }),
    ApiResponse({ status: 401, description: 'Unauthorized.' }),
    ApiResponse({ status: 404, description: 'Plan price not found.' }),
  );
}
