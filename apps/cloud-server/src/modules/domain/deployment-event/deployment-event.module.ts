import { Module } from '@nestjs/common';
import { DeploymentEventDomainRepository } from './repositories/deployment-event.repository';
import { DeploymentEventDomainService } from './services/deployment-event.service';

@Module({
  providers: [DeploymentEventDomainService, DeploymentEventDomainRepository],
  exports: [DeploymentEventDomainService],
})
export class DeploymentEventDomainModule {}
