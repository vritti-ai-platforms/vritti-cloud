import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { SuccessResponseDto } from '@vritti/api-sdk';
import { MarketCountryDto } from '../dto/entity/market-country.dto';
import { AssignMarketCountryDto } from '../dto/request/assign-market-country.dto';

// Swagger docs for listing countries assigned to a market
export function ApiGetMarketCountries() {
  return applyDecorators(
    ApiOperation({ summary: 'List countries assigned to a market' }),
    ApiParam({ name: 'marketId', description: 'Market UUID', example: '550e8400-e29b-41d4-a716-446655440000' }),
    ApiResponse({ status: 200, description: 'Market countries retrieved successfully.', type: [MarketCountryDto] }),
    ApiResponse({ status: 401, description: 'Unauthorized.' }),
    ApiResponse({ status: 404, description: 'Market not found.' }),
  );
}

// Swagger docs for assigning a country to a market
export function ApiAssignMarketCountry() {
  return applyDecorators(
    ApiOperation({ summary: 'Assign a country to a market' }),
    ApiParam({ name: 'marketId', description: 'Market UUID', example: '550e8400-e29b-41d4-a716-446655440000' }),
    ApiBody({ type: AssignMarketCountryDto }),
    ApiResponse({ status: 201, description: 'Country assigned to market successfully.', type: MarketCountryDto }),
    ApiResponse({ status: 400, description: 'Validation failed.' }),
    ApiResponse({ status: 401, description: 'Unauthorized.' }),
    ApiResponse({ status: 404, description: 'Market not found.' }),
    ApiResponse({ status: 409, description: 'Country already assigned to a market.' }),
  );
}

// Swagger docs for removing a country from a market
export function ApiRemoveMarketCountry() {
  return applyDecorators(
    ApiOperation({ summary: 'Remove a country from a market' }),
    ApiParam({ name: 'marketId', description: 'Market UUID', example: '550e8400-e29b-41d4-a716-446655440000' }),
    ApiParam({ name: 'countryId', description: 'Country UUID', example: '550e8400-e29b-41d4-a716-446655440000' }),
    ApiResponse({ status: 200, description: 'Country removed from market successfully.', type: SuccessResponseDto }),
    ApiResponse({ status: 401, description: 'Unauthorized.' }),
    ApiResponse({ status: 404, description: 'Market or country assignment not found.' }),
  );
}
