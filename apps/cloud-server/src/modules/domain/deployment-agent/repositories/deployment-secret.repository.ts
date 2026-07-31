import { Injectable } from '@nestjs/common';
import { PrimaryBaseRepository, PrimaryDatabaseService } from '@vritti/api-sdk/database';
import type { DeploymentSecret } from '@/db/schema';
import { deploymentSecrets } from '@/db/schema';

@Injectable()
export class DeploymentSecretDomainRepository extends PrimaryBaseRepository<typeof deploymentSecrets> {
  constructor(database: PrimaryDatabaseService) {
    super(database, deploymentSecrets);
  }

  // Returns all operator secrets for a deployment (encrypted at rest)
  async findByDeploymentId(deploymentId: string): Promise<DeploymentSecret[]> {
    return this.model.findMany({ where: { deploymentId } });
  }
}
