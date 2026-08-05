import { DeploymentAgentDomainModule } from '@domain/deployment-agent/deployment-agent.module';
import { Module } from '@nestjs/common';
import { AgentConnectService } from './connect/agent-connect.service';

// Agent API for managed deployments — a Connect (gRPC-compatible) service mounted on Fastify in main.ts,
// behind proxied api.<base>. Ed25519 request auth (no JWT/session). No Nest controllers: the Connect
// plugin owns the /agent.v1.AgentService/* routes; this module just provides the service to the DI
// container so main.ts can register it.
@Module({
  imports: [DeploymentAgentDomainModule],
  providers: [AgentConnectService],
  exports: [AgentConnectService],
})
export class AgentModule {}
