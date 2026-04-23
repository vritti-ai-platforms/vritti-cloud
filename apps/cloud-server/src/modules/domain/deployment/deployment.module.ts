import { Module } from '@nestjs/common';
import { DeploymentIndustryPlanRepository } from './repositories/deployment-industry-plan.repository';
import { DeploymentRepository } from './repositories/deployment.repository';
import { DeploymentService } from './services/deployment.service';

@Module({
  providers: [DeploymentService, DeploymentRepository, DeploymentIndustryPlanRepository],
  exports: [DeploymentService, DeploymentRepository, DeploymentIndustryPlanRepository],
})
export class DeploymentDomainModule {}
