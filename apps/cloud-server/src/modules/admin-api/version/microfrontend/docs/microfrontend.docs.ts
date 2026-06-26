import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiExtraModels, ApiOperation, ApiParam, ApiResponse, getSchemaPath } from '@nestjs/swagger';
import { SuccessResponseDto } from '@vritti/api-sdk';
import { MicrofrontendDto } from '../dto/entity/microfrontend.dto';
import { MobileMicrofrontendBodyDto } from '../dto/request/mobile-microfrontend-body.dto';
import { WebMicrofrontendBodyDto } from '../dto/request/web-microfrontend-body.dto';
import { MicrofrontendTableResponseDto } from '../dto/response/microfrontend-table-response.dto';

// Swagger docs for listing microfrontends in a data table
export function ApiFindForTableMicrofrontends() {
  return applyDecorators(
    ApiOperation({ summary: 'List microfrontends for data table (server-stored state)' }),
    ApiParam({ name: 'versionId', description: 'App version UUID', example: '550e8400-e29b-41d4-a716-446655440000' }),
    ApiResponse({
      status: 200,
      description: 'Microfrontends retrieved successfully.',
      type: MicrofrontendTableResponseDto,
    }),
    ApiResponse({ status: 401, description: 'Unauthorized.' }),
  );
}

// Swagger docs for upserting a microfrontend by platform (web | mobile)
export function ApiUpsertMicrofrontend() {
  return applyDecorators(
    ApiOperation({ summary: 'Create or update a microfrontend (upsert by version + code)' }),
    ApiParam({ name: 'versionId', description: 'App version UUID', example: '550e8400-e29b-41d4-a716-446655440000' }),
    ApiParam({ name: 'platform', description: 'Target platform', enum: ['web', 'mobile'], example: 'web' }),
    ApiExtraModels(WebMicrofrontendBodyDto, MobileMicrofrontendBodyDto),
    ApiBody({
      schema: {
        oneOf: [{ $ref: getSchemaPath(WebMicrofrontendBodyDto) }, { $ref: getSchemaPath(MobileMicrofrontendBodyDto) }],
      },
    }),
    ApiResponse({ status: 200, description: 'Microfrontend saved successfully.', type: MicrofrontendDto }),
    ApiResponse({ status: 400, description: 'Validation failed or invalid platform.' }),
    ApiResponse({ status: 401, description: 'Unauthorized.' }),
  );
}

// Swagger docs for deleting a microfrontend by platform + ID
export function ApiDeleteMicrofrontend() {
  return applyDecorators(
    ApiOperation({ summary: 'Delete a microfrontend' }),
    ApiParam({ name: 'versionId', description: 'App version UUID', example: '550e8400-e29b-41d4-a716-446655440000' }),
    ApiParam({ name: 'platform', description: 'Target platform', enum: ['web', 'mobile'], example: 'web' }),
    ApiParam({ name: 'id', description: 'Microfrontend UUID', example: '550e8400-e29b-41d4-a716-446655440000' }),
    ApiResponse({ status: 200, description: 'Microfrontend deleted successfully.', type: SuccessResponseDto }),
    ApiResponse({ status: 401, description: 'Unauthorized.' }),
    ApiResponse({ status: 409, description: 'Microfrontend is referenced by features.' }),
  );
}
