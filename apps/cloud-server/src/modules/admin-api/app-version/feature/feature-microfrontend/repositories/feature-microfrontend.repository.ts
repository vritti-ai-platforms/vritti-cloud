import { Injectable } from '@nestjs/common';
import { PrimaryBaseRepository, PrimaryDatabaseService } from '@vritti/api-sdk';
import { and, eq } from '@vritti/api-sdk/drizzle-orm';
import type { FeatureMicrofrontend } from '@/db/schema';
import { featureMicrofrontends, microfrontends } from '@/db/schema';

// Joined row shape returned by findByFeatureId
export type FeatureMicrofrontendJoinedRow = {
  id: string;
  featureId: string;
  microfrontendId: string;
  exposedModule: string;
  routePrefix: string;
  microfrontendCode: string;
  microfrontendName: string;
  platform: string;
  remoteEntry: string;
};

@Injectable()
export class FeatureMicrofrontendRepository extends PrimaryBaseRepository<typeof featureMicrofrontends> {
  constructor(database: PrimaryDatabaseService) {
    super(database, featureMicrofrontends);
  }

  // Finds all junction rows for a feature, joined with microfrontend details
  async findByFeatureId(featureId: string): Promise<FeatureMicrofrontendJoinedRow[]> {
    const rows = await this.db
      .select({
        id: featureMicrofrontends.id,
        featureId: featureMicrofrontends.featureId,
        microfrontendId: featureMicrofrontends.microfrontendId,
        exposedModule: featureMicrofrontends.exposedModule,
        routePrefix: featureMicrofrontends.routePrefix,
        microfrontendCode: microfrontends.code,
        microfrontendName: microfrontends.name,
        platform: microfrontends.platform,
        remoteEntry: microfrontends.remoteEntry,
      })
      .from(featureMicrofrontends)
      .innerJoin(microfrontends, eq(featureMicrofrontends.microfrontendId, microfrontends.id))
      .where(eq(featureMicrofrontends.featureId, featureId));
    return rows;
  }

  // Finds a junction row by feature and microfrontend for uniqueness check
  async findByFeatureAndMf(featureId: string, microfrontendId: string): Promise<FeatureMicrofrontend | undefined> {
    return this.model.findFirst({ where: { featureId, microfrontendId } });
  }

  // Inserts or updates a junction row on conflict (feature + microfrontend unique)
  async upsert(data: {
    appVersionId: string;
    featureId: string;
    microfrontendId: string;
    exposedModule: string;
    routePrefix: string;
  }): Promise<FeatureMicrofrontend> {
    const existing = await this.findByFeatureAndMf(data.featureId, data.microfrontendId);
    if (existing) {
      const results = await this.db
        .update(featureMicrofrontends)
        .set({ exposedModule: data.exposedModule, routePrefix: data.routePrefix })
        .where(eq(featureMicrofrontends.id, existing.id))
        .returning();
      return results[0] as FeatureMicrofrontend;
    }
    const results = await this.db.insert(featureMicrofrontends).values(data).returning();
    return results[0] as FeatureMicrofrontend;
  }

  // Deletes a junction row by feature and microfrontend
  async deleteByFeatureAndMf(featureId: string, microfrontendId: string): Promise<boolean> {
    const result = await this.db
      .delete(featureMicrofrontends)
      .where(and(eq(featureMicrofrontends.featureId, featureId), eq(featureMicrofrontends.microfrontendId, microfrontendId)))
      .returning();
    return result.length > 0;
  }

  // Counts how many feature-microfrontend links reference a given microfrontend
  async countByMicrofrontendId(microfrontendId: string): Promise<number> {
    const rows = await this.model.findMany({ where: { microfrontendId } });
    return rows.length;
  }
}
