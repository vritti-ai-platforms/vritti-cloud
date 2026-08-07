import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { SuccessResponseDto } from '@vritti/api-sdk/database';
import { DeploymentDto } from '../dto/entity/deployment.dto';
import { SigningKeyDto } from '../dto/entity/signing-key.dto';
import { CreateDeploymentDto } from '../dto/request/create-deployment.dto';
import { UpdateDeploymentDto } from '../dto/request/update-deployment.dto';
import { DeploymentsResponseDto } from '../dto/response/deployments-response.dto';

export function ApiCreateDeployment() {
  return applyDecorators(
    ApiOperation({
      summary: 'Create a new deployment',
      description:
        'Creates a bare deployment record with no signing key yet. regionId/cloudProviderId are required only for managementType=managed; manual deployments use the sentinel local region/provider. The nested components spec (database/edge/gitea/secretStore) applies only to managed deployments and is pushed to the agent in the desired-state; omit it for manual. Generate the signing key later via POST /admin-api/deployments/:id/signing-key, which reveals the public key once.',
    }),
    ApiBody({ type: CreateDeploymentDto }),
    ApiResponse({ status: 201, description: 'Deployment created successfully.', type: DeploymentDto }),
    ApiResponse({ status: 400, description: 'Validation failed.' }),
    ApiResponse({ status: 401, description: 'Unauthorized.' }),
  );
}

export function ApiRegenerateSigningKey() {
  return applyDecorators(
    ApiOperation({
      summary: "Generate or regenerate a deployment's signing keypair",
      description:
        'Generates the deployment signing keypair on first use, or regenerates it if one already exists, and returns the public key exactly once — it is never retrievable afterward. On regeneration the previous key stops verifying immediately; update the core deployment env (LICENSE_PUBLIC_KEY) and resync.',
    }),
    ApiParam({ name: 'id', description: 'Deployment UUID', example: '550e8400-e29b-41d4-a716-446655440000' }),
    ApiResponse({ status: 200, description: 'Signing key regenerated successfully.', type: SigningKeyDto }),
    ApiResponse({ status: 401, description: 'Unauthorized.' }),
    ApiResponse({ status: 404, description: 'Deployment not found.' }),
  );
}

export function ApiSyncCatalog() {
  return applyDecorators(
    ApiOperation({
      summary: 'Sync catalog license',
      description:
        "Re-pushes the signed feature/permission catalog snapshot to the deployment's core. Does not touch any organization's roles or entitlements.",
    }),
    ApiParam({ name: 'id', description: 'Deployment UUID', example: '550e8400-e29b-41d4-a716-446655440000' }),
    ApiResponse({ status: 200, description: 'Catalog license synced successfully.', type: SuccessResponseDto }),
    ApiResponse({ status: 401, description: 'Unauthorized.' }),
    ApiResponse({ status: 404, description: 'Deployment not found.' }),
  );
}

export function ApiFindAllDeployments() {
  return applyDecorators(
    ApiOperation({ summary: 'List all deployments' }),
    ApiResponse({ status: 200, description: 'Deployments retrieved successfully.', type: DeploymentsResponseDto }),
    ApiResponse({ status: 401, description: 'Unauthorized.' }),
  );
}

export function ApiFindDeploymentById() {
  return applyDecorators(
    ApiOperation({ summary: 'Get a deployment by ID' }),
    ApiParam({ name: 'id', description: 'Deployment UUID', example: '550e8400-e29b-41d4-a716-446655440000' }),
    ApiResponse({ status: 200, description: 'Deployment retrieved successfully.', type: DeploymentDto }),
    ApiResponse({ status: 401, description: 'Unauthorized.' }),
    ApiResponse({ status: 404, description: 'Deployment not found.' }),
  );
}

export function ApiUpdateDeployment() {
  return applyDecorators(
    ApiOperation({
      summary: 'Update a deployment',
      description:
        'Updates any deployment field. For managed deployments, a partial components spec (e.g. enabling pgBackRest on the database or enabling Gitea) folds into the stored spec and is pushed to the agent in the next desired-state.',
    }),
    ApiParam({ name: 'id', description: 'Deployment UUID', example: '550e8400-e29b-41d4-a716-446655440000' }),
    ApiBody({ type: UpdateDeploymentDto }),
    ApiResponse({ status: 200, description: 'Deployment updated successfully.', type: DeploymentDto }),
    ApiResponse({ status: 400, description: 'Validation failed.' }),
    ApiResponse({ status: 401, description: 'Unauthorized.' }),
    ApiResponse({ status: 404, description: 'Deployment not found.' }),
  );
}

export function ApiStopDeployment() {
  return applyDecorators(
    ApiOperation({
      summary: 'Stop a managed deployment',
      description:
        'Takes the whole managed stack offline: the desired-state flips to stopped and the agent tears down every service container. The VM data (database, backups, Gitea) persists, so Start restores the same state. Persistent — the deployment stays offline across an agent restart or VM reboot until started.',
    }),
    ApiParam({ name: 'id', description: 'Deployment UUID', example: '550e8400-e29b-41d4-a716-446655440000' }),
    ApiResponse({ status: 200, description: 'Deployment is stopping.', type: SuccessResponseDto }),
    ApiResponse({ status: 400, description: 'Not a managed deployment, or not currently active.' }),
    ApiResponse({ status: 401, description: 'Unauthorized.' }),
    ApiResponse({ status: 404, description: 'Deployment not found.' }),
  );
}

export function ApiStartDeployment() {
  return applyDecorators(
    ApiOperation({
      summary: 'Start a managed deployment',
      description:
        'Brings a stopped managed deployment back online: the desired-state flips to active and the agent reconciles the full stack back up from the persisted VM data.',
    }),
    ApiParam({ name: 'id', description: 'Deployment UUID', example: '550e8400-e29b-41d4-a716-446655440000' }),
    ApiResponse({ status: 200, description: 'Deployment is starting.', type: SuccessResponseDto }),
    ApiResponse({ status: 400, description: 'Not a managed deployment, or not currently stopped.' }),
    ApiResponse({ status: 401, description: 'Unauthorized.' }),
    ApiResponse({ status: 404, description: 'Deployment not found.' }),
  );
}

export function ApiDeleteDeployment() {
  return applyDecorators(
    ApiOperation({ summary: 'Delete a deployment' }),
    ApiParam({ name: 'id', description: 'Deployment UUID', example: '550e8400-e29b-41d4-a716-446655440000' }),
    ApiResponse({ status: 200, description: 'Deployment deleted successfully.', type: DeploymentDto }),
    ApiResponse({ status: 401, description: 'Unauthorized.' }),
    ApiResponse({ status: 404, description: 'Deployment not found.' }),
  );
}
