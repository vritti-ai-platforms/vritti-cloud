import { Injectable } from '@nestjs/common';
import { PrimaryBaseRepository, PrimaryDatabaseService } from '@vritti/api-sdk/database';
import { and, asc, count, eq, inArray, type SQL, sql } from '@vritti/api-sdk/drizzle-orm';
import {
  businessAppFeatures,
  businessApps,
  featurePermissions,
  features,
  permissionBusinesses,
  roleTemplateFeaturePermissions,
  type ScopeType,
  type SiteApplies,
} from '@/db/schema';

export interface BusinessFeatureApp {
  id: string;
  name: string;
}

export interface BusinessFeatureRow {
  id: string;
  code: string;
  name: string;
  lucideIcon: string;
  scope: ScopeType;
  applicableSiteTypes: SiteApplies[];
  app: BusinessFeatureApp;
  permissionCount: number;
}

@Injectable()
export class AppFeatureRepository extends PrimaryBaseRepository<typeof businessAppFeatures> {
  constructor(database: PrimaryDatabaseService) {
    super(database, businessAppFeatures);
  }

  // Returns the features a business's apps include (grouped by feature, with app + applicable-permission count) for the data table
  async findBusinessFeaturesForTable(
    versionId: string,
    businessId: string,
    options: { where?: SQL; orderBy?: SQL[]; limit: number; offset: number },
  ): Promise<{ result: BusinessFeatureRow[]; count: number }> {
    const conditions: SQL[] = [
      eq(businessAppFeatures.versionId, versionId),
      eq(businessAppFeatures.businessId, businessId),
    ];
    if (options.where) {
      conditions.push(options.where);
    }

    // Each feature pins to exactly one app within a business, so the app is a single object (no aggregation)
    return this.findAllAndCount<BusinessFeatureRow>({
      select: {
        id: features.id,
        code: features.code,
        name: features.name,
        lucideIcon: features.lucideIcon,
        scope: features.scope,
        applicableSiteTypes: features.applicableSiteTypes,
        app: sql<BusinessFeatureApp>`jsonb_build_object('id', ${businessApps.id}, 'name', ${businessApps.name})`,
        permissionCount: sql<number>`coalesce((
          select count(*)::int
          from ${featurePermissions} fp
          where fp.feature_id = ${features.id}
            and (fp.is_global = true or exists (select 1 from ${permissionBusinesses} pb where pb.feature_permission_id = fp.id and pb.business_id = ${businessId}))
        ), 0)`,
      },
      leftJoins: [
        { table: businessApps, on: eq(businessApps.id, businessAppFeatures.appId) },
        { table: features, on: eq(features.id, businessAppFeatures.featureId) },
      ],
      where: and(...conditions),
      groupBy: [features.id, businessApps.id, businessApps.name],
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
        id: businessAppFeatures.id,
        featureId: businessAppFeatures.featureId,
        code: features.code,
        name: features.name,
        sortOrder: businessAppFeatures.sortOrder,
      })
      .from(businessAppFeatures)
      .innerJoin(features, eq(features.id, businessAppFeatures.featureId))
      .where(eq(businessAppFeatures.appId, appId));
  }

  // Pins many features to one app in a business in a single statement (already-pinned features are left as-is)
  async assignFeaturesToApp(versionId: string, businessId: string, appId: string, featureIds: string[]): Promise<void> {
    if (featureIds.length === 0) return;
    await this.db
      .insert(businessAppFeatures)
      .values(featureIds.map((featureId) => ({ versionId, businessId, appId, featureId })))
      .onConflictDoNothing({ target: [businessAppFeatures.businessId, businessAppFeatures.featureId] });
  }

  // Removes many features from a business in one statement (unassigns each from its app)
  async removeFeaturesFromBusiness(businessId: string, featureIds: string[]): Promise<void> {
    if (featureIds.length === 0) return;
    await this.db
      .delete(businessAppFeatures)
      .where(and(eq(businessAppFeatures.businessId, businessId), inArray(businessAppFeatures.featureId, featureIds)));
  }

  // Pins a feature to a single app within a business (one-to-one); reassignment UPSERTS to preserve cascading memberships, appId=null deletes the row
  async setFeatureApp(versionId: string, businessId: string, featureId: string, appId: string | null): Promise<void> {
    if (!appId) {
      await this.db
        .delete(businessAppFeatures)
        .where(and(eq(businessAppFeatures.businessId, businessId), eq(businessAppFeatures.featureId, featureId)));
      return;
    }
    await this.db
      .insert(businessAppFeatures)
      .values({ versionId, businessId, appId, featureId })
      .onConflictDoUpdate({
        target: [businessAppFeatures.businessId, businessAppFeatures.featureId],
        set: { appId, versionId },
      });
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
    const baseWhere = where ? and(eq(businessAppFeatures.appId, appId), where) : eq(businessAppFeatures.appId, appId);

    const [rows, totalResult] = await Promise.all([
      this.db
        .select({
          featureId: businessAppFeatures.featureId,
          code: features.code,
          name: features.name,
          sortOrder: businessAppFeatures.sortOrder,
        })
        .from(businessAppFeatures)
        .innerJoin(features, eq(features.id, businessAppFeatures.featureId))
        .where(baseWhere)
        .orderBy(...(orderBy ?? []))
        .limit(limit)
        .offset(offset),
      this.db
        .select({ count: count() })
        .from(businessAppFeatures)
        .innerJoin(features, eq(features.id, businessAppFeatures.featureId))
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
        appId: businessAppFeatures.appId,
        featureId: businessAppFeatures.featureId,
        code: features.code,
        name: features.name,
      })
      .from(businessAppFeatures)
      .innerJoin(features, eq(features.id, businessAppFeatures.featureId))
      .where(inArray(businessAppFeatures.appId, appIds));
  }
}
