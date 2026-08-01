import { Injectable } from '@nestjs/common';
import { PrimaryBaseRepository, PrimaryDatabaseService } from '@vritti/api-sdk/database';
import type { DeploymentCertificate } from '@/db/schema';
import { deploymentCertificates } from '@/db/schema';

@Injectable()
export class DeploymentCertificateDomainRepository extends PrimaryBaseRepository<typeof deploymentCertificates> {
  constructor(database: PrimaryDatabaseService) {
    super(database, deploymentCertificates);
  }

  // Returns all tracked certificates for a deployment (expiry source of truth)
  async findByDeploymentId(deploymentId: string): Promise<DeploymentCertificate[]> {
    return this.model.findMany({ where: { deploymentId } });
  }

  // Upserts a reported certificate keyed by (deployment, host), refreshing validity + updatedAt
  async upsertByHost(deploymentId: string, data: { host: string; notAfter: Date; issuedAt: Date }): Promise<void> {
    await this.db
      .insert(deploymentCertificates)
      .values({ deploymentId, host: data.host, notAfter: data.notAfter, issuedAt: data.issuedAt })
      .onConflictDoUpdate({
        target: [deploymentCertificates.deploymentId, deploymentCertificates.host],
        set: { notAfter: data.notAfter, issuedAt: data.issuedAt, updatedAt: new Date() },
      });
  }
}
