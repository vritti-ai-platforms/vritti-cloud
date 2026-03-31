import { Injectable } from '@nestjs/common';
import { PrimaryBaseRepository, PrimaryDatabaseService } from '@vritti/api-sdk';
import { eq } from '@vritti/api-sdk/drizzle-orm';
import { roleTemplateApps } from '@/db/schema';

@Injectable()
export class RoleTemplateAppRepository extends PrimaryBaseRepository<typeof roleTemplateApps> {
  constructor(database: PrimaryDatabaseService) {
    super(database, roleTemplateApps);
  }

  // Returns all app IDs linked to a role template
  async findByRoleTemplateId(roleTemplateId: string): Promise<string[]> {
    const rows = await this.db.select({ appId: roleTemplateApps.appId }).from(roleTemplateApps).where(eq(roleTemplateApps.roleTemplateId, roleTemplateId));
    return rows.map((r) => r.appId);
  }

  // Replaces all app links for a role template
  async setApps(roleTemplateId: string, versionId: string, appIds: string[]): Promise<void> {
    await this.db.delete(roleTemplateApps).where(eq(roleTemplateApps.roleTemplateId, roleTemplateId));
    if (appIds.length > 0) {
      await this.db.insert(roleTemplateApps).values(appIds.map((appId) => ({ roleTemplateId, appId, versionId })));
    }
  }

  // Deletes all app links for a role template
  async deleteByRoleTemplateId(roleTemplateId: string): Promise<void> {
    await this.db.delete(roleTemplateApps).where(eq(roleTemplateApps.roleTemplateId, roleTemplateId));
  }
}
