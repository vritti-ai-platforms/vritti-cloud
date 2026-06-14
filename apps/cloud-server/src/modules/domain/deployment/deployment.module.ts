import { Module } from '@nestjs/common';
import { DeploymentRepository } from './repositories/deployment.repository';
import { DeploymentPlanRepository } from './repositories/deployment-plan.repository';
import { DeploymentService } from './services/deployment.service';

@Module({
  providers: [DeploymentService, DeploymentRepository, DeploymentPlanRepository],
  exports: [DeploymentService, DeploymentRepository, DeploymentPlanRepository],
})
export class DeploymentDomainModule {}
