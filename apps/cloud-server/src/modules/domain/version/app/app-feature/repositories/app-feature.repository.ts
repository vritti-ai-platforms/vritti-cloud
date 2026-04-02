import { Injectable } from '@nestjs/common';
import { PrimaryBaseRepository, PrimaryDatabaseService } from '@vritti/api-sdk';
import { and, count, eq, inArray, sql, type SQL } from '@vritti/api-sdk/drizzle-orm';
import type { AppFeature } from '@/db/schema';
import { appFeatures, features, roleTemplateFeaturePermissions } from '@/db/schema';

@Injectable()
export class AppFeatureRepository extends PrimaryBaseRepository<typeof appFeatures> {
  constructor(database: PrimaryDatabaseService) {
    super(database, appFeatures);
  }

  // Lists all features assigned to an app with feature details
  async findByAppWithFeatures(appId: string): Promise<
    Array<{
      id: string;
      featureId: string;
      code: string;
      name: string;
      sortOrder: number;
    }>
  > {
    return this.db
      .select({
        id: appFeatures.id,
        featureId: appFeatures.featureId,
        code: features.code,
        name: features.name,
        sortOrder: appFeatures.sortOrder,
      })
      .from(appFeatures)
      .innerJoin(features, eq(features.id, appFeatures.featureId))
      .where(eq(appFeatures.appId, appId));
  }

  // Finds an app-feature row by appId + featureId
  async findByAppAndFeature(appId: string, featureId: string): Promise<AppFeature | undefined> {
    return this.model.findFirst({ where: { appId, featureId } });
  }

  // Upserts app-feature rows using on-conflict update
  async upsertMany(rows: Array<{ versionId: string; appId: string; featureId: string; sortOrder?: number }>): Promise<void> {
    if (rows.length === 0) return;
    await this.db
      .insert(appFeatures)
      .values(rows)
      .onConflictDoNothing({
        target: [appFeatures.appId, appFeatures.featureId],
      });
  }

  // Deletes an app-feature by appId + featureId
  async removeByAppAndFeature(appId: string, featureId: string): Promise<void> {
    await this.db.delete(appFeatures).where(and(eq(appFeatures.appId, appId), eq(appFeatures.featureId, featureId)));
  }

  // Returns the set of feature IDs that exist in the features table from the given list
  async findExistingFeatureIds(featureIds: string[]): Promise<Set<string>> {
    if (featureIds.length === 0) return new Set();
    const rows = await this.db
      .select({ id: features.id })
      .from(features)
      .where(inArray(features.id, featureIds));
    return new Set(rows.map((r) => r.id));
  }

  // Counts how many role_template_feature_permissions reference a given feature
  async countRoleReferences(featureId: string): Promise<number> {
    const result = await this.db
      .select({ count: count() })
      .from(roleTemplateFeaturePermissions)
      .where(eq(roleTemplateFeaturePermissions.featureId, featureId));
    return Number(result[0]?.count ?? 0);
  }

  // Returns paginated app-feature rows joined with features for the data table
  async findAllForTable(
    appId: string,
    where: SQL | undefined,
    orderBy: SQL[] | undefined,
    limit: number,
    offset: number,
  ): Promise<{
    rows: Array<{ featureId: string; code: string; name: string; sortOrder: number }>;
    total: number;
  }> {
    const baseWhere = where ? and(eq(appFeatures.appId, appId), where) : eq(appFeatures.appId, appId);

    const [rows, totalResult] = await Promise.all([
      this.db
        .select({
          featureId: appFeatures.featureId,
          code: features.code,
          name: features.name,
          sortOrder: appFeatures.sortOrder,
        })
        .from(appFeatures)
        .innerJoin(features, eq(features.id, appFeatures.featureId))
        .where(baseWhere)
        .orderBy(...(orderBy ?? []))
        .limit(limit)
        .offset(offset),
      this.db
        .select({ count: count() })
        .from(appFeatures)
        .innerJoin(features, eq(features.id, appFeatures.featureId))
        .where(baseWhere),
    ]);

    return { rows, total: Number(totalResult[0]?.count ?? 0) };
  }

  // Returns features for multiple apps grouped by appId
  async findByAppsWithFeatures(
    appIds: string[],
  ): Promise<Array<{ appId: string; featureId: string; code: string; name: string }>> {
    if (appIds.length === 0) return [];
    return this.db
      .select({
        appId: appFeatures.appId,
        featureId: appFeatures.featureId,
        code: features.code,
        name: features.name,
      })
      .from(appFeatures)
      .innerJoin(features, eq(features.id, appFeatures.featureId))
      .where(inArray(appFeatures.appId, appIds));
  }
}
