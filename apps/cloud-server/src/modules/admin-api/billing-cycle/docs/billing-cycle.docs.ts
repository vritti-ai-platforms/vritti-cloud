import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { SuccessResponseDto } from '@vritti/api-sdk';
import { BillingCycleDto } from '../dto/entity/billing-cycle.dto';
import { CreateBillingCycleDto } from '../dto/request/create-billing-cycle.dto';
import { UpdateBillingCycleDto } from '../dto/request/update-billing-cycle.dto';
import { BillingCycleTableResponseDto } from '../dto/response/billing-cycles-response.dto';

export function ApiCreateBillingCycle() {
  return applyDecorators(
    ApiOperation({ summary: 'Create a new billing cycle' }),
    ApiBody({ type: CreateBillingCycleDto }),
    ApiResponse({ status: 201, description: 'Billing cycle created successfully.', type: BillingCycleDto }),
    ApiResponse({ status: 400, description: 'Validation failed.' }),
    ApiResponse({ status: 401, description: 'Unauthorized.' }),
    ApiResponse({ status: 409, description: 'Billing cycle with this name already exists.' }),
  );
}

export function ApiFindForTableBillingCycles() {
  return applyDecorators(
    ApiOperation({ summary: 'List billing cycles for data table (server-stored state)' }),
    ApiResponse({
      status: 200,
      description: 'Billing cycles retrieved successfully.',
      type: BillingCycleTableResponseDto,
    }),
    ApiResponse({ status: 401, description: 'Unauthorized.' }),
  );
}

export function ApiFindBillingCycleById() {
  return applyDecorators(
    ApiOperation({ summary: 'Get a billing cycle by ID' }),
    ApiParam({ name: 'id', description: 'Billing Cycle UUID', example: '550e8400-e29b-41d4-a716-446655440000' }),
    ApiResponse({ status: 200, description: 'Billing cycle retrieved successfully.', type: BillingCycleDto }),
    ApiResponse({ status: 401, description: 'Unauthorized.' }),
    ApiResponse({ status: 404, description: 'Billing cycle not found.' }),
  );
}

export function ApiUpdateBillingCycle() {
  return applyDecorators(
    ApiOperation({ summary: 'Update a billing cycle' }),
    ApiParam({ name: 'id', description: 'Billing Cycle UUID', example: '550e8400-e29b-41d4-a716-446655440000' }),
    ApiBody({ type: UpdateBillingCycleDto }),
    ApiResponse({ status: 200, description: 'Billing cycle updated successfully.', type: SuccessResponseDto }),
    ApiResponse({ status: 400, description: 'Validation failed.' }),
    ApiResponse({ status: 401, description: 'Unauthorized.' }),
    ApiResponse({ status: 404, description: 'Billing cycle not found.' }),
    ApiResponse({ status: 409, description: 'Billing cycle with this name already exists.' }),
  );
}

export function ApiDeleteBillingCycle() {
  return applyDecorators(
    ApiOperation({ summary: 'Delete a billing cycle' }),
    ApiParam({ name: 'id', description: 'Billing Cycle UUID', example: '550e8400-e29b-41d4-a716-446655440000' }),
    ApiResponse({ status: 200, description: 'Billing cycle deleted successfully.', type: SuccessResponseDto }),
    ApiResponse({ status: 401, description: 'Unauthorized.' }),
    ApiResponse({ status: 404, description: 'Billing cycle not found.' }),
    ApiResponse({ status: 409, description: 'Billing cycle is in use by prices.' }),
  );
}
