import { DeploymentDomainModule } from '@domain/deployment/deployment.module';
import { OrganizationDomainModule } from '@domain/organization/organization.module';
import { OrganizationMemberDomainModule } from '@domain/organization-member/organization-member.module';
import { Module } from '@nestjs/common';
import { DeploymentController } from './controllers/deployment.controller';
import { OrganizationController } from './organization/controllers/organization.controller';
import { OrganizationMemberController } from './organization/member/controllers/organization-member.controller';

@Module({
  imports: [DeploymentDomainModule, OrganizationDomainModule, OrganizationMemberDomainModule],
  controllers: [DeploymentController, OrganizationController, OrganizationMemberController],
})
export class AdminDeploymentModule {}
