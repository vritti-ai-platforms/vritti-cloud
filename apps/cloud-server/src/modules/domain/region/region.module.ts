import { Module } from '@nestjs/common';
import { CloudProviderDomainModule } from '../cloud-provider/cloud-provider.module';
import { DeploymentDomainModule } from '../deployment/deployment.module';
import { PriceDomainModule } from '../price/price.module';
import { RegionProviderRepository } from './repositories/region-provider.repository';
import { RegionRepository } from './repositories/region.repository';
import { RegionService } from './services/region.service';

@Module({
  imports: [CloudProviderDomainModule, DeploymentDomainModule, PriceDomainModule],
  providers: [RegionService, RegionRepository, RegionProviderRepository],
  exports: [RegionService, RegionRepository, RegionProviderRepository],
})
export class RegionDomainModule {}
