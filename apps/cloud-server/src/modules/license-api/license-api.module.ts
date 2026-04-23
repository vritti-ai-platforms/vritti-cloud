import { Module } from '@nestjs/common';
import { CloudOrganizationDomainModule } from '@domain/cloud-organization/cloud-organization.module';
import { CoreServerModule } from '@/modules/core-server/core-server.module';
import { LicenseConfigController } from './config/controllers/license-config.controller';
import { LicenseConfigService } from './config/services/license-config.service';

@Module({
  imports: [CloudOrganizationDomainModule, CoreServerModule],
  controllers: [LicenseConfigController],
  providers: [LicenseConfigService],
})
export class LicenseApiModule {}
