import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { SuccessResponseDto } from '@vritti/api-sdk';
import { MarketDto } from '../dto/entity/market.dto';
import { CreateMarketDto } from '../dto/request/create-market.dto';
import { UpdateMarketDto } from '../dto/request/update-market.dto';
import { MarketTableResponseDto } from '../dto/response/markets-response.dto';

export function ApiCreateMarket() {
  return applyDecorators(
    ApiOperation({ summary: 'Create a new market' }),
    ApiBody({ type: CreateMarketDto }),
    ApiResponse({ status: 201, description: 'Market created successfully.', type: MarketDto }),
    ApiResponse({ status: 400, description: 'Validation failed.' }),
    ApiResponse({ status: 401, description: 'Unauthorized.' }),
    ApiResponse({ status: 409, description: 'Market with this code already exists.' }),
  );
}

export function ApiFindForTableMarkets() {
  return applyDecorators(
    ApiOperation({ summary: 'List markets for data table (server-stored state)' }),
    ApiResponse({ status: 200, description: 'Markets retrieved successfully.', type: MarketTableResponseDto }),
    ApiResponse({ status: 401, description: 'Unauthorized.' }),
  );
}

export function ApiFindMarketById() {
  return applyDecorators(
    ApiOperation({ summary: 'Get a market by ID' }),
    ApiParam({ name: 'id', description: 'Market UUID', example: '550e8400-e29b-41d4-a716-446655440000' }),
    ApiResponse({ status: 200, description: 'Market retrieved successfully.', type: MarketDto }),
    ApiResponse({ status: 401, description: 'Unauthorized.' }),
    ApiResponse({ status: 404, description: 'Market not found.' }),
  );
}

export function ApiUpdateMarket() {
  return applyDecorators(
    ApiOperation({ summary: 'Update a market' }),
    ApiParam({ name: 'id', description: 'Market UUID', example: '550e8400-e29b-41d4-a716-446655440000' }),
    ApiBody({ type: UpdateMarketDto }),
    ApiResponse({ status: 200, description: 'Market updated successfully.', type: SuccessResponseDto }),
    ApiResponse({ status: 400, description: 'Validation failed.' }),
    ApiResponse({ status: 401, description: 'Unauthorized.' }),
    ApiResponse({ status: 404, description: 'Market not found.' }),
    ApiResponse({ status: 409, description: 'Market with this code already exists.' }),
  );
}

export function ApiDeleteMarket() {
  return applyDecorators(
    ApiOperation({ summary: 'Delete a market' }),
    ApiParam({ name: 'id', description: 'Market UUID', example: '550e8400-e29b-41d4-a716-446655440000' }),
    ApiResponse({ status: 200, description: 'Market deleted successfully.', type: SuccessResponseDto }),
    ApiResponse({ status: 401, description: 'Unauthorized.' }),
    ApiResponse({ status: 404, description: 'Market not found.' }),
    ApiResponse({ status: 409, description: 'Market is in use and cannot be deleted.' }),
  );
}
