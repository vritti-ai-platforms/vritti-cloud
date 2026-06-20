import { Module } from '@nestjs/common';
import { DeploymentRepository } from './repositories/deployment.repository';
import { DeploymentService } from './services/deployment.service';

@Module({
  providers: [DeploymentService, DeploymentRepository],
  exports: [DeploymentService, DeploymentRepository],
})
export class DeploymentDomainModule {}
