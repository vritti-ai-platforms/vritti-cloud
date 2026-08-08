import { DeploymentDomainModule } from '@domain/deployment/deployment.module';
import { MediaDomainModule } from '@domain/media/media.module';
import { Module } from '@nestjs/common';
import { CoreServerModule } from '@/modules/core-server/core-server.module';
import { OrganizationDomainRepository } from './repositories/organization.repository';
import { OrganizationDomainService } from './services/organization.service';

@Module({
  imports: [CoreServerModule, MediaDomainModule, DeploymentDomainModule],
  providers: [OrganizationDomainService, OrganizationDomainRepository],
  exports: [OrganizationDomainService, OrganizationDomainRepository],
})
export class OrganizationDomainModule {}
