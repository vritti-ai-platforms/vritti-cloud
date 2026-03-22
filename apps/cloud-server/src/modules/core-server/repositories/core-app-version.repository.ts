import { Injectable } from '@nestjs/common';
import { PrimaryBaseRepository, PrimaryDatabaseService } from '@vritti/api-sdk';
import type { AppVersion } from '@/db/schema';
import { appVersions } from '@/db/schema';

// Minimal app version repository for snapshot lookups
@Injectable()
export class CoreAppVersionRepository extends PrimaryBaseRepository<typeof appVersions> {
  constructor(database: PrimaryDatabaseService) {
    super(database, appVersions);
  }

  // Finds an app version by ID
  async findById(id: string): Promise<AppVersion | undefined> {
    return this.model.findFirst({ where: { id } });
  }
}
