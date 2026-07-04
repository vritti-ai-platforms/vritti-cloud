import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
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
        'Generates an Ed25519 signing keypair for the deployment. The response includes publicKey exactly once — it is never retrievable afterward. Use POST /admin-api/deployments/:id/signing-key to regenerate.',
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
      summary: "Regenerate a deployment's signing keypair",
      description:
        'Replaces the deployment signing key and returns the new public key exactly once — it is never retrievable afterward. The previous key stops verifying immediately; update the core deployment env (CLOUD_PUBLIC_KEY) and resync.',
    }),
    ApiParam({ name: 'id', description: 'Deployment UUID', example: '550e8400-e29b-41d4-a716-446655440000' }),
    ApiResponse({ status: 200, description: 'Signing key regenerated successfully.', type: SigningKeyDto }),
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
    ApiOperation({ summary: 'Update a deployment' }),
    ApiParam({ name: 'id', description: 'Deployment UUID', example: '550e8400-e29b-41d4-a716-446655440000' }),
    ApiBody({ type: UpdateDeploymentDto }),
    ApiResponse({ status: 200, description: 'Deployment updated successfully.', type: DeploymentDto }),
    ApiResponse({ status: 400, description: 'Validation failed.' }),
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
