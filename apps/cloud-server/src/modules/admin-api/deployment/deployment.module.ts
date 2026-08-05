import { DeploymentDomainModule } from '@domain/deployment/deployment.module';
import { DeploymentAgentDomainModule } from '@domain/deployment-agent/deployment-agent.module';
import { DeploymentEventDomainModule } from '@domain/deployment-event/deployment-event.module';
import { OrganizationDomainModule } from '@domain/organization/organization.module';
import { OrganizationMemberDomainModule } from '@domain/organization-member/organization-member.module';
import { Module } from '@nestjs/common';
import { CoreServerModule } from '@/modules/core-server/core-server.module';
import { DeploymentAgentController } from './agent/controllers/deployment-agent.controller';
import { DeploymentAgentSseListener } from './agent/listeners/deployment-agent-sse.listener';
import { DeploymentAgentLogsService } from './agent/services/deployment-agent-logs.service';
import { DeploymentAgentSseService } from './agent/services/deployment-agent-sse.service';
import { DeploymentController } from './controllers/deployment.controller';
import { OrganizationController } from './organization/controllers/organization.controller';
import { OrganizationMemberController } from './organization/member/controllers/organization-member.controller';

@Module({
  imports: [
    DeploymentDomainModule,
    DeploymentAgentDomainModule,
    DeploymentEventDomainModule,
    OrganizationDomainModule,
    OrganizationMemberDomainModule,
    CoreServerModule,
  ],
  controllers: [DeploymentController, DeploymentAgentController, OrganizationController, OrganizationMemberController],
  providers: [DeploymentAgentSseService, DeploymentAgentSseListener, DeploymentAgentLogsService],
})
export class AdminDeploymentModule {}
