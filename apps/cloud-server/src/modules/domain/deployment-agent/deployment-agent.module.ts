import { DeploymentEventDomainModule } from '@domain/deployment-event/deployment-event.module';
import { Module } from '@nestjs/common';
import { DeploymentAgentDomainRepository } from './repositories/deployment-agent.repository';
import { DeploymentCertificateDomainRepository } from './repositories/deployment-certificate.repository';
import { DeploymentSecretDomainRepository } from './repositories/deployment-secret.repository';
import { AgentConnectivityService } from './services/agent-connectivity.service';
import { AgentCryptoService } from './services/agent-crypto.service';
import { DeploymentAgentDomainService } from './services/deployment-agent.service';
import { DesiredStateDomainService } from './services/desired-state.service';

@Module({
  imports: [DeploymentEventDomainModule],
  providers: [
    DeploymentAgentDomainService,
    DesiredStateDomainService,
    AgentCryptoService,
    AgentConnectivityService,
    DeploymentAgentDomainRepository,
    DeploymentSecretDomainRepository,
    DeploymentCertificateDomainRepository,
  ],
  exports: [DeploymentAgentDomainService, AgentCryptoService, AgentConnectivityService],
})
export class DeploymentAgentDomainModule {}
