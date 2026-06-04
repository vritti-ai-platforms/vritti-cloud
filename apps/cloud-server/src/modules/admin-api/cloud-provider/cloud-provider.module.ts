import { Module } from '@nestjs/common';
import { CloudProviderDomainModule } from '@domain/cloud-provider/cloud-provider.module';
import { CloudProviderController } from './controllers/cloud-provider.controller';

@Module({
  imports: [CloudProviderDomainModule],
  controllers: [CloudProviderController],
})
export class AdminCloudProviderModule {}
