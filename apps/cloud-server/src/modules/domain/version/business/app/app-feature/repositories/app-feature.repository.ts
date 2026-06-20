import { Injectable } from '@nestjs/common';
import { PrimaryBaseRepository, PrimaryDatabaseService, type TypedDrizzleClient } from '@vritti/api-sdk';
import { and, asc, count, eq, inArray, type SQL, sql } from '@vritti/api-sdk/drizzle-orm';
import type { AppFeature } from '@/db/schema';
import {
  appFeatures,
  apps,
  featurePermissions,
  features,
  permissionBusinesses,
  roleTemplateFeaturePermissions,
} from '@/db/schema';

export interface BusinessFeatureApp {
  id: string;
  name: string;
}

export interface BusinessFeatureRow {
  id: string;
  code: string;
  name: string;
  icon: string;
  apps: BusinessFeatureApp[];
  permissionCount: number;
}

@Injectable()
export class AppFeatureRepository extends PrimaryBaseRepository<typeof appFeatures> {
  constructor(database: PrimaryDatabaseService) {
    super(database, appFeatures);
  }

  // Returns the features a business's apps include (grouped by feature) for the data table.
  // Membership comes from app_features (scoped to the business's apps); each row carries its business apps
  // and a count of its applicable permissions (the permission list is fetched separately).
  async findBusinessFeaturesForTable(
    versionId: string,
    businessId: string,
    options: { where?: SQL; orderBy?: SQL[]; limit: number; offset: number },
  ): Promise<{ result: BusinessFeatureRow[]; count: number }> {
    const conditions: SQL[] = [eq(appFeatures.versionId, versionId), eq(apps.businessId, businessId)];
    if (options.where) {
      conditions.push(options.where);
    }

    return this.findAllAndCount<BusinessFeatureRow>({
      select: {
        id: features.id,
        code: features.code,
        name: features.name,
        icon: features.icon,
        apps: sql<
          BusinessFeatureApp[]
        >`coalesce(jsonb_agg(distinct jsonb_build_object('id', ${apps.id}, 'name', ${apps.name})), '[]'::jsonb)`,
        permissionCount: sql<number>`coalesce((
          select count(*)::int
          from ${featurePermissions} fp
          where fp.feature_id = ${features.id}
            and (fp.is_global = true or exists (select 1 from ${permissionBusinesses} pb where pb.feature_permission_id = fp.id and pb.business_id = ${businessId}))
        ), 0)`,
      },
      leftJoins: [
        { table: apps, on: eq(apps.id, appFeatures.appId) },
        { table: features, on: eq(features.id, appFeatures.featureId) },
      ],
      where: and(...conditions),
      groupBy: [features.id],
      orderBy: options.orderBy && options.orderBy.length > 0 ? options.orderBy : [asc(features.sortOrder)],
      limit: options.limit,
      offset: options.offset,
    });
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
  async upsertMany(
    rows: Array<{ versionId: string; appId: string; featureId: string; sortOrder?: number }>,
  ): Promise<void> {
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

  // Replaces a feature's app links within a business — clears links to the business's apps, then inserts the given ones
  async setFeatureApps(
    versionId: string,
    featureId: string,
    businessAppIds: string[],
    appIds: string[],
    tx?: TypedDrizzleClient,
  ): Promise<void> {
    const db = tx ?? this.db;
    if (businessAppIds.length > 0) {
      await db
        .delete(appFeatures)
        .where(and(eq(appFeatures.featureId, featureId), inArray(appFeatures.appId, businessAppIds)));
    }
    if (appIds.length > 0) {
      await db
        .insert(appFeatures)
        .values(appIds.map((appId) => ({ versionId, appId, featureId })))
        .onConflictDoNothing({ target: [appFeatures.appId, appFeatures.featureId] });
    }
  }

  // Counts how many role_template_feature_permissions reference a given feature (via its permissions)
  async countRoleReferences(featureId: string): Promise<number> {
    const result = await this.db
      .select({ count: count() })
      .from(roleTemplateFeaturePermissions)
      .innerJoin(featurePermissions, eq(featurePermissions.id, roleTemplateFeaturePermissions.featurePermissionId))
      .where(eq(featurePermissions.featureId, featureId));
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
