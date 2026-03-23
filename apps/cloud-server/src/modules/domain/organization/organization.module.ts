import { Module } from '@nestjs/common';
import { CoreServerModule } from '@/modules/core-server/core-server.module';
import { DeploymentDomainModule } from '../deployment/deployment.module';
import { OrganizationRepository } from './repositories/organization.repository';
import { OrganizationService } from './services/organization.service';

@Module({
  imports: [DeploymentDomainModule, CoreServerModule],
  providers: [OrganizationService, OrganizationRepository],
  exports: [OrganizationService, OrganizationRepository],
})
export class OrganizationDomainModule {}
