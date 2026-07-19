import { Module } from '@nestjs/common';
import { CloudProviderDomainModule } from '../cloud-provider/cloud-provider.module';
import { DeploymentDomainModule } from '../deployment/deployment.module';
import { RegionDomainRepository } from './repositories/region.repository';
import { RegionProviderDomainRepository } from './repositories/region-provider.repository';
import { RegionDomainService } from './services/region.service';

@Module({
  imports: [CloudProviderDomainModule, DeploymentDomainModule],
  providers: [RegionDomainService, RegionDomainRepository, RegionProviderDomainRepository],
  exports: [RegionDomainService, RegionDomainRepository, RegionProviderDomainRepository],
})
export class RegionDomainModule {}
