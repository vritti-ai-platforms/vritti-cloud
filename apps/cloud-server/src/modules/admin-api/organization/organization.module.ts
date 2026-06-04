import { Module } from '@nestjs/common';
import { OrganizationDomainModule } from '@domain/organization/organization.module';
import { OrganizationMemberDomainModule } from '@domain/organization-member/organization-member.module';
import { OrganizationController } from './controllers/organization.controller';

@Module({
  imports: [OrganizationDomainModule, OrganizationMemberDomainModule],
  controllers: [OrganizationController],
})
export class AdminOrganizationModule {}
