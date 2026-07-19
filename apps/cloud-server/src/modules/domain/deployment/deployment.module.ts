import { Module } from '@nestjs/common';
import { DeploymentDomainRepository } from './repositories/deployment.repository';
import { DeploymentDomainService } from './services/deployment.service';

@Module({
  providers: [DeploymentDomainService, DeploymentDomainRepository],
  exports: [DeploymentDomainService, DeploymentDomainRepository],
})
export class DeploymentDomainModule {}
