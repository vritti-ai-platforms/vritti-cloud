import { Injectable } from '@nestjs/common';
import { PrimaryBaseRepository, PrimaryDatabaseService } from '@vritti/api-sdk';
import type { Version } from '@/db/schema';
import { versions } from '@/db/schema';

// Minimal version repository for snapshot lookups
@Injectable()
export class CoreVersionRepository extends PrimaryBaseRepository<typeof versions> {
  constructor(database: PrimaryDatabaseService) {
    super(database, versions);
  }

  // Finds a version by ID
  async findById(id: string): Promise<Version | undefined> {
    return this.model.findFirst({ where: { id } });
  }

  // Finds a version by its version string
  async findByVersion(version: string): Promise<Version | undefined> {
    return this.model.findFirst({ where: { version } });
  }
}
