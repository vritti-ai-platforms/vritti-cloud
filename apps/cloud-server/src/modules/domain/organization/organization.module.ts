import { Module } from '@nestjs/common';
import { CoreServerModule } from '@/modules/core-server/core-server.module';
import { OrganizationDomainRepository } from './repositories/organization.repository';
import { OrganizationDomainService } from './services/organization.service';

@Module({
  imports: [CoreServerModule],
  providers: [OrganizationDomainService, OrganizationDomainRepository],
  exports: [OrganizationDomainService, OrganizationDomainRepository],
})
export class OrganizationDomainModule {}
