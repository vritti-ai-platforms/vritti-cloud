import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { OrgCredential, OrgStorage, OrgStorageTracking } from '@vritti/api-sdk/storage';
import { OrgStorageProvisionerFactory } from '@vritti/api-sdk/storage';

const TENANT_STORAGE_PROVIDER = 'r2';

@Injectable()
export class OrgStorageProvisioningService {
  private factory: OrgStorageProvisionerFactory | null = null;

  constructor(private readonly configService: ConfigService) {}

  // Creates the org's buckets and its scoped credential. Throws rather than returning null: env validation already
  // requires the Cloudflare credentials, so an unconfigured environment never reaches here — it fails at boot.
  async provisionOrg(subdomain: string): Promise<OrgStorage> {
    return this.resolveFactory().resolve(TENANT_STORAGE_PROVIDER).provisionOrg(subdomain);
  }

  // Mints a replacement credential for the org's existing buckets
  async rotateCredential(subdomain: string, tracking: OrgStorageTracking): Promise<OrgCredential> {
    return this.resolveFactory().resolve(TENANT_STORAGE_PROVIDER).rotateCredential(subdomain, {
      storageBucket: tracking.bucket,
      storagePublicBucket: tracking.publicBucket,
    });
  }

  // Removes the org's buckets. Core must have emptied them first — R2 will not delete a bucket that holds objects.
  async deleteBuckets(tracking: OrgStorageTracking): Promise<void> {
    return this.resolveFactory()
      .resolve(TENANT_STORAGE_PROVIDER)
      .deleteOrgBuckets({ storageBucket: tracking.bucket, storagePublicBucket: tracking.publicBucket });
  }

  // Revokes a credential by its access key id
  async revokeCredential(accessKeyId: string): Promise<void> {
    return this.resolveFactory().resolve(TENANT_STORAGE_PROVIDER).deleteCredential(accessKeyId);
  }

  // Built on first use rather than at construction, so the credentials are read when provisioning actually happens
  private resolveFactory(): OrgStorageProvisionerFactory {
    this.factory ??= new OrgStorageProvisionerFactory({
      r2: () => ({
        accountId: this.configService.getOrThrow<string>('R2_ACCOUNT_ID'),
        adminToken: this.configService.getOrThrow<string>('R2_ADMIN_TOKEN'),
        tokensToken: this.configService.getOrThrow<string>('CLOUDFLARE_TOKEN'),
        locationHint: 'apac',
      }),
    });
    return this.factory;
  }
}
