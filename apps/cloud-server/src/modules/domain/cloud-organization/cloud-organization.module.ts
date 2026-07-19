import { Module } from '@nestjs/common';
import { CloudOrganizationDomainRepository } from './repositories/organization.repository';
import { CloudOrganizationMemberDomainRepository } from './repositories/organization-member.repository';

@Module({
  providers: [CloudOrganizationDomainRepository, CloudOrganizationMemberDomainRepository],
  exports: [CloudOrganizationDomainRepository, CloudOrganizationMemberDomainRepository],
})
export class CloudOrganizationDomainModule {}
