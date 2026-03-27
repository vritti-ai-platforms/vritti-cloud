import { Injectable } from '@nestjs/common';
import { PrimaryBaseRepository, PrimaryDatabaseService } from '@vritti/api-sdk';
import { eq, inArray, sql } from '@vritti/api-sdk/drizzle-orm';
import type { Feature } from '@/db/schema';
import { appFeatures, apps, featurePermissions, features } from '@/db/schema';

@Injectable()
export class FeatureRepository extends PrimaryBaseRepository<typeof features> {
  constructor(database: PrimaryDatabaseService) {
    super(database, features);
  }

  // Finds a feature by its unique identifier
  async findById(id: string): Promise<Feature | undefined> {
    return this.model.findFirst({ where: { id } });
  }

  // Finds a feature by its unique code
  async findByCode(code: string): Promise<Feature | undefined> {
    return this.model.findFirst({ where: { code } });
  }

  // Finds all features for a given app version
  async findAllByVersionId(versionId: string): Promise<Feature[]> {
    return this.model.findMany({ where: { versionId } });
  }

  // Counts how many app_features reference a given feature
  async countAppFeatureReferences(featureId: string): Promise<number> {
    const result = await this.db
      .select({ count: sql<number>`count(*)` })
      .from(appFeatures)
      .where(eq(appFeatures.featureId, featureId));
    return Number(result[0]?.count ?? 0);
  }

  // Returns a set of feature IDs that have at least one app_feature reference (cannot be deleted)
  async findReferencedIds(ids: string[]): Promise<Set<string>> {
    if (ids.length === 0) return new Set();
    const rows = await this.db
      .select({ id: appFeatures.featureId })
      .from(appFeatures)
      .where(inArray(appFeatures.featureId, ids));
    const referenced = new Set<string>();
    for (const row of rows) {
      if (row.id) referenced.add(row.id);
    }
    return referenced;
  }

  // Returns permission types grouped by feature ID for a given app version
  async findPermissionsByVersionId(versionId: string): Promise<Map<string, string[]>> {
    const rows = await this.db
      .select({
        featureId: featurePermissions.featureId,
        type: featurePermissions.type,
      })
      .from(featurePermissions)
      .where(eq(featurePermissions.versionId, versionId));

    const map = new Map<string, string[]>();
    for (const row of rows) {
      const existing = map.get(row.featureId);
      if (existing) {
        existing.push(row.type);
      } else {
        map.set(row.featureId, [row.type]);
      }
    }
    return map;
  }

  // Returns app codes grouped by feature ID for a given app version
  async findAppCodesByVersionId(versionId: string): Promise<Map<string, string[]>> {
    const rows = await this.db
      .select({
        featureId: appFeatures.featureId,
        appCode: apps.code,
      })
      .from(appFeatures)
      .innerJoin(apps, eq(appFeatures.appId, apps.id))
      .where(eq(appFeatures.versionId, versionId));

    const map = new Map<string, string[]>();
    for (const row of rows) {
      const existing = map.get(row.featureId);
      if (existing) {
        existing.push(row.appCode);
      } else {
        map.set(row.featureId, [row.appCode]);
      }
    }
    return map;
  }
}
