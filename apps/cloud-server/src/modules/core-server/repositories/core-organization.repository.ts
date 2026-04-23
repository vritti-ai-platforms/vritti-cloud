import { Injectable } from '@nestjs/common';
import { PrimaryBaseRepository, PrimaryDatabaseService } from '@vritti/api-sdk';
import { organizations } from '@/db/schema';

// Minimal organization repository for deployment resolution
@Injectable()
export class CoreOrganizationRepository extends PrimaryBaseRepository<typeof organizations> {
  constructor(database: PrimaryDatabaseService) {
    super(database, organizations);
  }
}
