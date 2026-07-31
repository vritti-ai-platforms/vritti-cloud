import { DeploymentAgentDomainModule } from '@domain/deployment-agent/deployment-agent.module';
import { Module } from '@nestjs/common';
import { AgentController } from './controllers/agent.controller';
import { AgentSignatureGuard } from './guards/agent-signature.guard';

// Top-level /agent API for the managed-deployment agent (Ed25519 request auth, no JWT/session)
@Module({
  imports: [DeploymentAgentDomainModule],
  controllers: [AgentController],
  providers: [AgentSignatureGuard],
})
export class AgentModule {}
