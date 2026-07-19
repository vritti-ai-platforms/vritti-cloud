import { Module } from '@nestjs/common';
import { OrganizationMemberDomainRepository } from './repositories/organization-member.repository';
import { OrganizationMemberDomainService } from './services/organization-member.service';

@Module({
  providers: [OrganizationMemberDomainService, OrganizationMemberDomainRepository],
  exports: [OrganizationMemberDomainService, OrganizationMemberDomainRepository],
})
export class OrganizationMemberDomainModule {}
