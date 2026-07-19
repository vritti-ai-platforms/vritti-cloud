import { DeploymentDomainService } from '@domain/deployment/services/deployment.service';
import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Logger, Param, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { RequireSession } from '@vritti/api-sdk/auth';
import { CreateResponseDto, SuccessResponseDto } from '@vritti/api-sdk/database';
import { SessionTypeValues } from '@/db/schema';
import {
  ApiCreateDeployment,
  ApiDeleteDeployment,
  ApiFindAllDeployments,
  ApiFindDeploymentById,
  ApiRegenerateSigningKey,
  ApiUpdateDeployment,
} from '../docs/deployment.docs';
import { DeploymentDto } from '../dto/entity/deployment.dto';
import { SigningKeyDto } from '../dto/entity/signing-key.dto';
import { CreateDeploymentDto } from '../dto/request/create-deployment.dto';
import { UpdateDeploymentDto } from '../dto/request/update-deployment.dto';
import { DeploymentsResponseDto } from '../dto/response/deployments-response.dto';

@ApiTags('Admin - Deployments')
@ApiBearerAuth()
@RequireSession(SessionTypeValues.ADMIN)
@Controller('deployments')
export class DeploymentController {
  private readonly logger = new Logger(DeploymentController.name);

  constructor(private readonly deploymentService: DeploymentDomainService) {}

  // Creates a new deployment
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiCreateDeployment()
  create(@Body() dto: CreateDeploymentDto): Promise<CreateResponseDto<DeploymentDto>> {
    this.logger.log('POST /admin-api/deployments');
    return this.deploymentService.create(dto);
  }

  // Returns all deployments
  @Get()
  @ApiFindAllDeployments()
  findAll(): Promise<DeploymentsResponseDto> {
    this.logger.log('GET /admin-api/deployments');
    return this.deploymentService.findAll();
  }

  // Returns a single deployment by ID
  @Get(':id')
  @ApiFindDeploymentById()
  findById(@Param('id') id: string): Promise<DeploymentDto> {
    this.logger.log(`GET /admin-api/deployments/${id}`);
    return this.deploymentService.findById(id);
  }

  // Regenerates the deployment's signing keypair and returns the new public key (one-time reveal)
  @Post(':id/signing-key')
  @HttpCode(HttpStatus.OK)
  @ApiRegenerateSigningKey()
  regenerateSigningKey(@Param('id') id: string): Promise<CreateResponseDto<SigningKeyDto>> {
    this.logger.log(`POST /admin-api/deployments/${id}/signing-key`);
    return this.deploymentService.regenerateSigningKey(id);
  }

  // Updates a deployment by ID
  @Patch(':id')
  @ApiUpdateDeployment()
  update(@Param('id') id: string, @Body() dto: UpdateDeploymentDto): Promise<SuccessResponseDto> {
    this.logger.log(`PATCH /admin-api/deployments/${id}`);
    return this.deploymentService.update(id, dto);
  }

  // Deletes a deployment by ID
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiDeleteDeployment()
  delete(@Param('id') id: string): Promise<SuccessResponseDto> {
    this.logger.log(`DELETE /admin-api/deployments/${id}`);
    return this.deploymentService.delete(id);
  }
}
