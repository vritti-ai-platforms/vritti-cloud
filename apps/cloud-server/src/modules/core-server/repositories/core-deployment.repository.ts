import { Injectable } from '@nestjs/common';
import { PrimaryBaseRepository, PrimaryDatabaseService } from '@vritti/api-sdk';
import { deployments } from '@/db/schema';

// Minimal deployment repository for deployment resolution
@Injectable()
export class CoreDeploymentRepository extends PrimaryBaseRepository<typeof deployments> {
  constructor(database: PrimaryDatabaseService) {
    super(database, deployments);
  }
}
