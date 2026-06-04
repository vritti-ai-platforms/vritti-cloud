import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { SuccessResponseDto } from '@vritti/api-sdk';
import { PlanAppDto } from '../dto/entity/plan-app.dto';
import { AssignPlanAppDto } from '../dto/request/assign-plan-app.dto';
import { UpdatePlanAppDto } from '../dto/request/update-plan-app.dto';
import { PlanAppTableResponseDto } from '../dto/response/plan-app-table-response.dto';

// Swagger docs for fetching plan apps data table with server-stored state
export function ApiFindForTablePlanApps() {
  return applyDecorators(
    ApiOperation({ summary: 'Get plan apps for data table with server-stored state' }),
    ApiParam({ name: 'planId', description: 'Plan UUID', example: '550e8400-e29b-41d4-a716-446655440000' }),
    ApiResponse({ status: 200, description: 'Plan apps table data retrieved successfully.', type: PlanAppTableResponseDto }),
    ApiResponse({ status: 401, description: 'Unauthorized.' }),
    ApiResponse({ status: 404, description: 'Plan not found.' }),
  );
}

// Swagger docs for listing apps assigned to a plan
export function ApiGetPlanApps() {
  return applyDecorators(
    ApiOperation({ summary: 'List apps assigned to a plan' }),
    ApiParam({ name: 'planId', description: 'Plan UUID', example: '550e8400-e29b-41d4-a716-446655440000' }),
    ApiResponse({ status: 200, description: 'Plan apps retrieved successfully.', type: [PlanAppDto] }),
    ApiResponse({ status: 401, description: 'Unauthorized.' }),
    ApiResponse({ status: 404, description: 'Plan not found.' }),
  );
}

// Swagger docs for assigning an app to a plan
export function ApiAssignPlanApp() {
  return applyDecorators(
    ApiOperation({ summary: 'Assign an app to a plan' }),
    ApiParam({ name: 'planId', description: 'Plan UUID', example: '550e8400-e29b-41d4-a716-446655440000' }),
    ApiBody({ type: AssignPlanAppDto }),
    ApiResponse({ status: 201, description: 'App assigned to plan successfully.', type: PlanAppDto }),
    ApiResponse({ status: 400, description: 'Validation failed.' }),
    ApiResponse({ status: 401, description: 'Unauthorized.' }),
    ApiResponse({ status: 404, description: 'Plan or app not found.' }),
    ApiResponse({ status: 409, description: 'App already assigned to this plan.' }),
  );
}

// Swagger docs for updating a plan-app assignment
export function ApiUpdatePlanApp() {
  return applyDecorators(
    ApiOperation({ summary: 'Update included feature codes for a plan-app assignment' }),
    ApiParam({ name: 'planId', description: 'Plan UUID', example: '550e8400-e29b-41d4-a716-446655440000' }),
    ApiParam({ name: 'appCode', description: 'App code string', example: 'crm' }),
    ApiBody({ type: UpdatePlanAppDto }),
    ApiResponse({ status: 200, description: 'Plan app updated successfully.', type: SuccessResponseDto }),
    ApiResponse({ status: 400, description: 'Validation failed.' }),
    ApiResponse({ status: 401, description: 'Unauthorized.' }),
    ApiResponse({ status: 404, description: 'Plan or plan-app assignment not found.' }),
  );
}

// Swagger docs for removing an app from a plan
export function ApiRemovePlanApp() {
  return applyDecorators(
    ApiOperation({ summary: 'Remove an app from a plan' }),
    ApiParam({ name: 'planId', description: 'Plan UUID', example: '550e8400-e29b-41d4-a716-446655440000' }),
    ApiParam({ name: 'appCode', description: 'App code string', example: 'crm' }),
    ApiResponse({ status: 200, description: 'App removed from plan successfully.', type: SuccessResponseDto }),
    ApiResponse({ status: 401, description: 'Unauthorized.' }),
    ApiResponse({ status: 404, description: 'Plan or plan-app assignment not found.' }),
  );
}
