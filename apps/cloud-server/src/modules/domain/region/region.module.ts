import { Module } from '@nestjs/common';
import { CloudProviderDomainModule } from '../cloud-provider/cloud-provider.module';
import { DeploymentDomainModule } from '../deployment/deployment.module';
import { RegionRepository } from './repositories/region.repository';
import { RegionProviderRepository } from './repositories/region-provider.repository';
import { RegionService } from './services/region.service';

@Module({
  imports: [CloudProviderDomainModule, DeploymentDomainModule],
  providers: [RegionService, RegionRepository, RegionProviderRepository],
  exports: [RegionService, RegionRepository, RegionProviderRepository],
})
export class RegionDomainModule {}
