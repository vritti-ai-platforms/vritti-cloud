import { Module } from '@nestjs/common';
import { DeploymentBusinessPlanRepository } from './repositories/deployment-business-plan.repository';
import { DeploymentRepository } from './repositories/deployment.repository';
import { DeploymentService } from './services/deployment.service';

@Module({
  providers: [DeploymentService, DeploymentRepository, DeploymentBusinessPlanRepository],
  exports: [DeploymentService, DeploymentRepository, DeploymentBusinessPlanRepository],
})
export class DeploymentDomainModule {}
