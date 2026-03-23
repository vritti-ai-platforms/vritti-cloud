import { Injectable } from '@nestjs/common';
import { PrimaryBaseRepository, PrimaryDatabaseService } from '@vritti/api-sdk';
import { and, eq } from '@vritti/api-sdk/drizzle-orm';
import type { IndustryApp } from '@/db/schema';
import { apps, industryApps } from '@/db/schema';

export type IndustryAppRow = {
  id: string;
  industryId: string;
  appId: string;
  appCode: string;
  appName: string;
  isRecommended: boolean;
  sortOrder: number;
};

@Injectable()
export class IndustryAppRepository extends PrimaryBaseRepository<typeof industryApps> {
  constructor(database: PrimaryDatabaseService) {
    super(database, industryApps);
  }

  // Returns all industry-app rows for an industry with app name and code
  async findByIndustryId(industryId: string): Promise<IndustryAppRow[]> {
    return this.db
      .select({
        id: industryApps.id,
        industryId: industryApps.industryId,
        appId: industryApps.appId,
        appCode: apps.code,
        appName: apps.name,
        isRecommended: industryApps.isRecommended,
        sortOrder: industryApps.sortOrder,
      })
      .from(industryApps)
      .innerJoin(apps, eq(apps.id, industryApps.appId))
      .where(eq(industryApps.industryId, industryId));
  }

  // Finds an industry-app row by industryId and appId
  async findByIndustryAndApp(industryId: string, appId: string): Promise<IndustryApp | undefined> {
    return this.model.findFirst({ where: { industryId, appId } });
  }

  // Updates isRecommended and sortOrder for an industry-app row
  async updateFields(id: string, data: { isRecommended?: boolean; sortOrder?: number }): Promise<IndustryApp> {
    const result = await this.db
      .update(industryApps)
      .set(data)
      .where(eq(industryApps.id, id))
      .returning();
    return result[0] as IndustryApp;
  }

  // Deletes an industry-app row by industryId and appId
  async removeByIndustryAndApp(industryId: string, appId: string): Promise<void> {
    await this.db.delete(industryApps).where(and(eq(industryApps.industryId, industryId), eq(industryApps.appId, appId)));
  }
}
