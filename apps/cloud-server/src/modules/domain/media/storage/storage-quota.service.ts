import { CloudOrganizationDomainRepository } from '@domain/cloud-organization/repositories/organization.repository';
import { PlanDomainRepository } from '@domain/plan/repositories/plan.repository';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression } from '@nestjs/schedule';
import { BucketUsageReader, type OrgStorageTracking } from '@vritti/api-sdk/storage';
import type { Organization } from '@/db/schema';
import { coreBaseUrl } from '@/modules/core-server/core-url.util';
import { CoreDeploymentService } from '@/modules/core-server/services/core-deployment.service';
import { CoreOrganizationService } from '@/modules/core-server/services/core-organization.service';
import { requireSigningKey } from '@/modules/core-server/signing-key.util';

export interface OrgStorageUsage {
  usedBytes: number;
  limitBytes: number | null;
  provisioned: boolean;
}

@Injectable()
export class StorageQuotaService {
  private readonly logger = new Logger(StorageQuotaService.name);
  private reader: BucketUsageReader | null = null;

  constructor(
    private readonly orgRepository: CloudOrganizationDomainRepository,
    private readonly planRepository: PlanDomainRepository,
    private readonly coreDeploymentService: CoreDeploymentService,
    private readonly coreOrganizationService: CoreOrganizationService,
    private readonly configService: ConfigService,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_2AM)
  async checkAllOrgs(): Promise<void> {
    const orgs = await this.orgRepository.findAllProvisioned();
    this.logger.log(`Storage quota check starting for ${orgs.length} org(s)`);

    let overLimit = 0;
    for (const org of orgs) {
      try {
        if (await this.checkOrg(org.id)) overLimit++;
      } catch (error: unknown) {
        // One org's failure must not abandon the rest of the sweep
        this.logger.warn(`Storage quota check failed for org ${org.id}: ${error}`);
      }
    }

    this.logger.log(`Storage quota check finished; ${overLimit} org(s) over their limit`);
  }

  // Reads the org's real bucket usage and pushes the verdict to core. Returns whether the org is over its limit —
  // not whether that changed, which would need the previous verdict and is not worth a round trip to core for a log.
  async checkOrg(orgId: string): Promise<boolean> {
    const { org, deployment } = await this.coreDeploymentService.resolveOrgDeployment(orgId);
    if (!org.storage) return false;

    const { usedBytes, limitBytes } = await this.measure(org, deployment.version);
    // An unresolvable plan must not silently mean "unlimited" — leave the previous verdict alone and say so
    if (limitBytes === null) {
      this.logger.warn(`No storage limit resolved for org ${orgId} (plan ${org.planCode}); leaving verdict unchanged`);
      return false;
    }

    const storageEnabled = usedBytes < limitBytes;

    // Pushed every run, not only on change: core is the system of record for the verdict, and a push that failed
    // last time has to be retried or the org stays wrongly blocked
    await this.coreOrganizationService.updateOrganization(
      coreBaseUrl(deployment),
      requireSigningKey(deployment),
      org.orgIdentifier,
      { storageEnabled },
    );

    this.logger.log(
      `Org ${orgId}: ${usedBytes} / ${limitBytes} bytes — uploads ${storageEnabled ? 'enabled' : 'blocked'}`,
    );
    return !storageEnabled;
  }

  // Live usage straight from the provider, for the UI. Nothing is cached: a stored figure would be stale the moment
  // the next object lands, and the quota verdict is the only thing that needs to be durable.
  async getUsage(orgId: string): Promise<OrgStorageUsage> {
    const { org, deployment } = await this.coreDeploymentService.resolveOrgDeployment(orgId);
    if (!org.storage) return { usedBytes: 0, limitBytes: null, provisioned: false };

    const { usedBytes, limitBytes } = await this.measure(org, deployment.version);
    return { usedBytes, limitBytes, provisioned: true };
  }

  // Both buckets count against one allowance, so they are summed
  private async measure(
    org: Organization,
    version: string | null,
  ): Promise<{ usedBytes: number; limitBytes: number | null }> {
    const reader = this.resolveReader();
    const storage = org.storage as OrgStorageTracking;
    const [privateUsage, publicUsage] = await Promise.all([
      reader.getBucketUsage(storage.bucket),
      reader.getBucketUsage(storage.publicBucket),
    ]);

    return {
      usedBytes: privateUsage.bytes + publicUsage.bytes,
      limitBytes: await this.resolveLimitBytes(version, org.businessCode, org.planCode),
    };
  }

  // Read from cloud.plans rather than the version snapshot, so raising a customer's allowance takes effect on the
  // next run instead of requiring the catalog version to be re-snapshotted and republished to every deployment
  private async resolveLimitBytes(
    version: string | null,
    businessCode: string,
    planCode: string,
  ): Promise<number | null> {
    if (!version) return null;
    const plan = await this.planRepository.findByVersionStringAndCodes(version, businessCode, planCode);
    // Decimal, not binary: storage providers bill in decimal MB/GB (IEC: MB = 10^6, MiB = 2^20), so a plan sold
    // as N MB has to enforce the same N MB we are invoiced for, or the quota drifts 4.9% from the bill.
    return plan ? plan.storageLimitMb * 1000 * 1000 : null;
  }

  private resolveReader(): BucketUsageReader {
    this.reader ??= new BucketUsageReader({
      accountId: this.configService.getOrThrow<string>('R2_ACCOUNT_ID'),
      analyticsToken: this.configService.getOrThrow<string>('CLOUDFLARE_TOKEN'),
    });
    return this.reader;
  }
}
