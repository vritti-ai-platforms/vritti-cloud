import { Module } from '@nestjs/common';
import { OrganizationRepository } from './repositories/organization.repository';
import { OrganizationMemberRepository } from './repositories/organization-member.repository';

@Module({
  providers: [OrganizationRepository, OrganizationMemberRepository],
  exports: [OrganizationRepository, OrganizationMemberRepository],
})
export class CloudOrganizationDomainModule {}
