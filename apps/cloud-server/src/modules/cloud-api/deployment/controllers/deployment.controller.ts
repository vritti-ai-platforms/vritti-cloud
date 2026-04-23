import { DeploymentService } from '@domain/deployment/services/deployment.service';
import { Controller, Get, Logger, Param, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Public } from '@vritti/api-sdk';
import { DeploymentsResponseDto } from '@/modules/admin-api/deployment/dto/response/deployments-response.dto';
import { ApiFindAllPublicDeployments, ApiGetDeploymentPlans, ApiGetDeployments } from '../docs/deployment.docs';
import { DeploymentFilterDto, DeploymentPlanQueryDto } from '../dto/request/deployment-filter.dto';
import type { DeploymentOptionDto } from '../dto/response/deployment-option.dto';
import type { PlanOptionDto } from '../dto/response/plan-option.dto';

@ApiTags('Deployments')
@ApiBearerAuth()
@Controller('deployments')
export class CloudDeploymentController {
  private readonly logger = new Logger(CloudDeploymentController.name);

  constructor(private readonly deploymentService: DeploymentService) {}

  // Returns every deployment for public discovery
  @Get('all')
  @Public()
  @ApiFindAllPublicDeployments()
  findAll(): Promise<DeploymentsResponseDto> {
    this.logger.log('GET /cloud-api/deployments/all');
    return this.deploymentService.findAll();
  }

  // Returns active deployments for the given region, provider, and industry
  @Get()
  @ApiGetDeployments()
  findActive(@Query() query: DeploymentFilterDto): Promise<DeploymentOptionDto[]> {
    this.logger.log('GET /cloud-api/deployments');
    return this.deploymentService.findActive(query);
  }

  // Returns plans assigned to a deployment for the given industry, with price info
  @Get(':id/plans')
  @ApiGetDeploymentPlans()
  getPlans(@Param('id') id: string, @Query() query: DeploymentPlanQueryDto): Promise<PlanOptionDto[]> {
    this.logger.log(`GET /cloud-api/deployments/${id}/plans`);
    return this.deploymentService.findPlansForDeployment(id, query);
  }
}
