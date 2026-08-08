import { CloudOrganizationDomainModule } from '@domain/cloud-organization/cloud-organization.module';
import { PlanDomainModule } from '@domain/plan/plan.module';
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { StorageFactory } from '@vritti/api-sdk/storage';
import { CoreServerModule } from '@/modules/core-server/core-server.module';
import { MediaDomainRepository } from './repositories/media.repository';
import { MediaDomainService } from './services/media.service';
import { OrgStorageProvisioningService } from './storage/org-storage-provisioning.service';
import { StorageQuotaService } from './storage/storage-quota.service';

@Module({
  imports: [CloudOrganizationDomainModule, PlanDomainModule, CoreServerModule],
  providers: [
    MediaDomainService,
    MediaDomainRepository,
    OrgStorageProvisioningService,
    StorageQuotaService,
    {
      provide: StorageFactory,
      // Config is passed as a thunk: R2_* is only required while R2 is the selected provider, so reading it here
      // eagerly would break startup on a deployment backed by another provider
      useFactory: (configService: ConfigService) =>
        new StorageFactory({
          r2: () => ({
            accountId: configService.getOrThrow<string>('R2_ACCOUNT_ID'),
            accessKeyId: configService.getOrThrow<string>('R2_ACCESS_KEY_ID'),
            secretAccessKey: configService.getOrThrow<string>('R2_SECRET_ACCESS_KEY'),
            defaultBucket: configService.getOrThrow<string>('R2_BUCKET_NAME'),
            publicBucket: configService.getOrThrow<string>('R2_PUBLIC_BUCKET'),
            publicUrl: configService.getOrThrow<string>('R2_PUBLIC_URL'),
          }),
        }),
      inject: [ConfigService],
    },
  ],
  exports: [MediaDomainService, OrgStorageProvisioningService, StorageQuotaService],
})
export class MediaDomainModule {}
