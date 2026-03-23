import { Module } from '@nestjs/common';
import { OrganizationMemberRepository } from './repositories/organization-member.repository';
import { OrganizationMemberService } from './services/organization-member.service';

@Module({
  providers: [OrganizationMemberService, OrganizationMemberRepository],
  exports: [OrganizationMemberService, OrganizationMemberRepository],
})
export class OrganizationMemberDomainModule {}
