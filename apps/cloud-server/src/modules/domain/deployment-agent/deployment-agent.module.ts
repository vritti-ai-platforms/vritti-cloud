import { Module } from '@nestjs/common';
import { DeploymentAgentDomainRepository } from './repositories/deployment-agent.repository';
import { DeploymentCertificateDomainRepository } from './repositories/deployment-certificate.repository';
import { DeploymentSecretDomainRepository } from './repositories/deployment-secret.repository';
import { DeploymentAgentDomainService } from './services/deployment-agent.service';
import { DesiredStateDomainService } from './services/desired-state.service';

@Module({
  providers: [
    DeploymentAgentDomainService,
    DesiredStateDomainService,
    DeploymentAgentDomainRepository,
    DeploymentSecretDomainRepository,
    DeploymentCertificateDomainRepository,
  ],
  exports: [DeploymentAgentDomainService],
})
export class DeploymentAgentDomainModule {}
