import { Module } from '@nestjs/common';
import { CloudProviderRepository } from './repositories/cloud-provider.repository';
import { CloudProviderService } from './services/cloud-provider.service';

@Module({
  providers: [CloudProviderService, CloudProviderRepository],
  exports: [CloudProviderService, CloudProviderRepository],
})
export class CloudProviderDomainModule {}
