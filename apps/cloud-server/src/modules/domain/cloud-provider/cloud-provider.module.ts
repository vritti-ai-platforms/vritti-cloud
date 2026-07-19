import { Module } from '@nestjs/common';
import { CloudProviderDomainRepository } from './repositories/cloud-provider.repository';
import { CloudProviderDomainService } from './services/cloud-provider.service';

@Module({
  providers: [CloudProviderDomainService, CloudProviderDomainRepository],
  exports: [CloudProviderDomainService, CloudProviderDomainRepository],
})
export class CloudProviderDomainModule {}
