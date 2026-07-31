import { Module } from '@nestjs/common';
import { DeploymentAgentDomainRepository } from './repositories/deployment-agent.repository';
import { DeploymentSecretDomainRepository } from './repositories/deployment-secret.repository';
import { DeploymentAgentDomainService } from './services/deployment-agent.service';
import { DesiredStateDomainService } from './services/desired-state.service';

@Module({
  providers: [
    DeploymentAgentDomainService,
    DesiredStateDomainService,
    DeploymentAgentDomainRepository,
    DeploymentSecretDomainRepository,
  ],
  exports: [DeploymentAgentDomainService],
})
export class DeploymentAgentDomainModule {}
