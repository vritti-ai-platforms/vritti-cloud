import { DeploymentAgentDomainModule } from '@domain/deployment-agent/deployment-agent.module';
import { DeploymentDomainModule } from '@domain/deployment/deployment.module';
import { OrganizationDomainModule } from '@domain/organization/organization.module';
import { OrganizationMemberDomainModule } from '@domain/organization-member/organization-member.module';
import { Module } from '@nestjs/common';
import { CoreServerModule } from '@/modules/core-server/core-server.module';
import { DeploymentAgentController } from './agent/controllers/deployment-agent.controller';
import { DeploymentController } from './controllers/deployment.controller';
import { OrganizationController } from './organization/controllers/organization.controller';
import { OrganizationMemberController } from './organization/member/controllers/organization-member.controller';

@Module({
  imports: [
    DeploymentDomainModule,
    DeploymentAgentDomainModule,
    OrganizationDomainModule,
    OrganizationMemberDomainModule,
    CoreServerModule,
  ],
  controllers: [DeploymentController, DeploymentAgentController, OrganizationController, OrganizationMemberController],
})
export class AdminDeploymentModule {}
