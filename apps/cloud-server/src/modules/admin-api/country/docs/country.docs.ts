import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { SuccessResponseDto } from '@vritti/api-sdk';
import { CountryDto } from '../dto/entity/country.dto';
import { CreateCountryDto } from '../dto/request/create-country.dto';
import { UpdateCountryDto } from '../dto/request/update-country.dto';
import { CountryTableResponseDto } from '../dto/response/countries-response.dto';

export function ApiCreateCountry() {
  return applyDecorators(
    ApiOperation({ summary: 'Create a new country' }),
    ApiBody({ type: CreateCountryDto }),
    ApiResponse({ status: 201, description: 'Country created successfully.', type: CountryDto }),
    ApiResponse({ status: 400, description: 'Validation failed.' }),
    ApiResponse({ status: 401, description: 'Unauthorized.' }),
    ApiResponse({ status: 409, description: 'Country with this code already exists.' }),
  );
}

export function ApiFindForTableCountries() {
  return applyDecorators(
    ApiOperation({ summary: 'List countries for data table (server-stored state)' }),
    ApiResponse({ status: 200, description: 'Countries retrieved successfully.', type: CountryTableResponseDto }),
    ApiResponse({ status: 401, description: 'Unauthorized.' }),
  );
}

export function ApiGetCountryById() {
  return applyDecorators(
    ApiOperation({ summary: 'Get a country by ID' }),
    ApiParam({ name: 'id', description: 'Country UUID', example: '550e8400-e29b-41d4-a716-446655440000' }),
    ApiResponse({ status: 200, description: 'Country retrieved successfully.', type: CountryDto }),
    ApiResponse({ status: 401, description: 'Unauthorized.' }),
    ApiResponse({ status: 404, description: 'Country not found.' }),
  );
}

export function ApiUpdateCountry() {
  return applyDecorators(
    ApiOperation({ summary: 'Update a country' }),
    ApiParam({ name: 'id', description: 'Country UUID', example: '550e8400-e29b-41d4-a716-446655440000' }),
    ApiBody({ type: UpdateCountryDto }),
    ApiResponse({ status: 200, description: 'Country updated successfully.', type: SuccessResponseDto }),
    ApiResponse({ status: 400, description: 'Validation failed.' }),
    ApiResponse({ status: 401, description: 'Unauthorized.' }),
    ApiResponse({ status: 404, description: 'Country not found.' }),
    ApiResponse({ status: 409, description: 'Country with this code already exists.' }),
  );
}

export function ApiDeleteCountry() {
  return applyDecorators(
    ApiOperation({ summary: 'Delete a country' }),
    ApiParam({ name: 'id', description: 'Country UUID', example: '550e8400-e29b-41d4-a716-446655440000' }),
    ApiResponse({ status: 200, description: 'Country deleted successfully.', type: SuccessResponseDto }),
    ApiResponse({ status: 401, description: 'Unauthorized.' }),
    ApiResponse({ status: 404, description: 'Country not found.' }),
    ApiResponse({ status: 409, description: 'Country has one or more plan/app prices.' }),
  );
}
