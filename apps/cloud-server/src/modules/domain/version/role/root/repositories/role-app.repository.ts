import { Injectable } from '@nestjs/common';
import { PrimaryBaseRepository, PrimaryDatabaseService } from '@vritti/api-sdk';
import { eq } from '@vritti/api-sdk/drizzle-orm';
import { roleApps } from '@/db/schema';

@Injectable()
export class RoleAppRepository extends PrimaryBaseRepository<typeof roleApps> {
  constructor(database: PrimaryDatabaseService) {
    super(database, roleApps);
  }

  // Returns all app IDs linked to a role
  async findByRoleId(roleId: string): Promise<string[]> {
    const rows = await this.db.select({ appId: roleApps.appId }).from(roleApps).where(eq(roleApps.roleId, roleId));
    return rows.map((r) => r.appId);
  }

  // Replaces all app links for a role
  async setApps(roleId: string, versionId: string, appIds: string[]): Promise<void> {
    await this.db.delete(roleApps).where(eq(roleApps.roleId, roleId));
    if (appIds.length > 0) {
      await this.db.insert(roleApps).values(appIds.map((appId) => ({ roleId, appId, versionId })));
    }
  }

  // Deletes all app links for a role
  async deleteByRoleId(roleId: string): Promise<void> {
    await this.db.delete(roleApps).where(eq(roleApps.roleId, roleId));
  }
}
