import { Injectable } from '@nestjs/common';
import {
  type FindForSelectConfig,
  PrimaryBaseRepository,
  PrimaryDatabaseService,
  type SelectQueryResult,
} from '@vritti/api-sdk/database';
import { and, countDistinct, eq, inArray, type SQL, sql } from '@vritti/api-sdk/drizzle-orm';
import type { Feature } from '@/db/schema';
import { businessAppFeatures, businessApps, featurePermissions, features, permissionBusinesses } from '@/db/schema';

export type FeatureTableRow = Feature & {
  permissions: string[];
  platforms: string[];
  appFeatureCount: number;
  businessCount: number;
};

@Injectable()
export class FeatureRepository extends PrimaryBaseRepository<typeof features> {
  constructor(database: PrimaryDatabaseService) {
    super(database, features);
  }

  // Finds a feature by its unique identifier
  async findById(id: string): Promise<Feature | undefined> {
    return this.model.findFirst({ where: { id } });
  }

  // Finds a feature by ID and checks whether it has at least one permission
  async findByIdWithPermissionCheck(id: string): Promise<{ feature: Feature; hasPermissions: boolean } | undefined> {
    const row = await this.model.findFirst({
      where: { id },
      with: { featurePermissions: { columns: { id: true }, limit: 1 } },
    });
    if (!row) return undefined;
    const { featurePermissions: perms, ...feature } = row as Feature & { featurePermissions: { id: string }[] };
    return { feature, hasPermissions: perms.length > 0 };
  }

  // Finds a feature by its unique code
  async findByCode(code: string): Promise<Feature | undefined> {
    return this.model.findFirst({ where: { code } });
  }

  // Finds all features for a given app version
  async findAllByVersionId(versionId: string): Promise<Feature[]> {
    return this.model.findMany({ where: { versionId } });
  }

  // Returns all features for a version — single query for export (permissions authored separately)
  async findAllForExport(
    versionId: string,
  ): Promise<{ code: string; name: string; lucideIcon: string; description: string | null }[]> {
    const rows = await this.db
      .select({
        code: features.code,
        name: features.name,
        lucideIcon: features.lucideIcon,
        description: features.description,
      })
      .from(features)
      .where(eq(features.versionId, versionId))
      .orderBy(features.sortOrder);
    return rows;
  }

  async countAppFeatureReferences(featureId: string): Promise<number> {
    const result = await this.db
      .select({ count: sql<number>`count(*)` })
      .from(businessAppFeatures)
      .where(eq(businessAppFeatures.featureId, featureId));
    return Number(result[0]?.count ?? 0);
  }

  // Returns features with permissions, platforms, and canDelete in a single query
  async findAllForTable(options: {
    where?: SQL;
    orderBy?: SQL[];
    limit: number;
    offset: number;
  }): Promise<{ result: FeatureTableRow[]; count: number }> {
    return this.findAllAndCount<FeatureTableRow>({
      select: {
        id: features.id,
        versionId: features.versionId,
        code: features.code,
        name: features.name,
        description: features.description,
        lucideIcon: features.lucideIcon,
        isActive: features.isActive,
        sortOrder: features.sortOrder,
        createdAt: features.createdAt,
        updatedAt: features.updatedAt,
        permissions: sql<string[]>`array_remove(array_agg(distinct ${featurePermissions.code}), null)`.mapWith({
          mapFromDriverValue: (value: unknown) =>
            Array.isArray(value) ? value : value === '{}' || !value ? [] : String(value).slice(1, -1).split(','),
        }),
        // Platforms a feature has a route on, derived from its own web/mobile link columns
        platforms: sql<string[]>`array_remove(array[
          case when ${features.webMfId} is not null then 'WEB' end,
          case when ${features.mobileMfId} is not null then 'MOBILE' end
        ], null)`.mapWith({
          mapFromDriverValue: (value: unknown) =>
            Array.isArray(value) ? value : value === '{}' || !value ? [] : String(value).slice(1, -1).split(','),
        }),
        appFeatureCount: countDistinct(businessAppFeatures.id),
        businessCount: countDistinct(businessApps.businessId),
      },
      leftJoins: [
        { table: featurePermissions, on: eq(featurePermissions.featureId, features.id) },
        { table: businessAppFeatures, on: eq(businessAppFeatures.featureId, features.id) },
        { table: businessApps, on: eq(businessApps.id, businessAppFeatures.appId) },
      ],
      groupBy: [features.id],
      where: options.where,
      orderBy: options.orderBy,
      limit: options.limit,
      offset: options.offset,
    });
  }

  // Of the given feature ids, returns those addable to a business: belong to the version AND have an applicable global or business-scoped permission
  async findAddableIds(versionId: string, businessId: string, featureIds: string[]): Promise<string[]> {
    if (featureIds.length === 0) return [];
    const rows = await this.db
      .select({ id: features.id })
      .from(features)
      .where(
        and(
          inArray(features.id, featureIds),
          eq(features.versionId, versionId),
          sql`exists (
            select 1 from ${featurePermissions} fp
            where fp.feature_id = ${features.id}
              and (fp.is_global = true or exists (
                select 1 from ${permissionBusinesses} pb
                where pb.feature_permission_id = fp.id and pb.business_id = ${businessId}
              ))
          )`,
        ),
      );
    return rows.map((r) => r.id);
  }

  async findForSelectForBusiness(config: FindForSelectConfig, businessId: string): Promise<SelectQueryResult> {
    const available = sql`
      exists (
        select 1 from ${featurePermissions} fp
        where fp.feature_id = ${features.id}
          and (fp.is_global = true or exists (
            select 1 from ${permissionBusinesses} pb
            where pb.feature_permission_id = fp.id and pb.business_id = ${businessId}
          ))
      )
      and not exists (
        select 1 from ${businessAppFeatures} af
        join ${businessApps} a on a.id = af.app_id
        where af.feature_id = ${features.id} and a.business_id = ${businessId}
      )`;
    return this.findForSelect({ ...config, conditions: [...(config.conditions ?? []), available] });
  }

  // Sets the feature's web microfrontend link columns
  async setWebMicrofrontend(
    featureId: string,
    link: { webMfId: string; webExposedModule: string; webRoutePrefix: string },
  ): Promise<Feature> {
    const rows = await this.db.update(features).set(link).where(eq(features.id, featureId)).returning();
    return rows[0] as Feature;
  }

  // Sets the feature's mobile microfrontend link columns
  async setMobileMicrofrontend(
    featureId: string,
    link: { mobileMfId: string; mobileExposedModule: string; mobileRoutePrefix: string },
  ): Promise<Feature> {
    const rows = await this.db.update(features).set(link).where(eq(features.id, featureId)).returning();
    return rows[0] as Feature;
  }

  // Clears the feature's web microfrontend link columns
  async clearWebMicrofrontend(featureId: string): Promise<Feature> {
    const rows = await this.db
      .update(features)
      .set({ webMfId: null, webExposedModule: null, webRoutePrefix: null })
      .where(eq(features.id, featureId))
      .returning();
    return rows[0] as Feature;
  }

  // Clears the feature's mobile microfrontend link columns
  async clearMobileMicrofrontend(featureId: string): Promise<Feature> {
    const rows = await this.db
      .update(features)
      .set({ mobileMfId: null, mobileExposedModule: null, mobileRoutePrefix: null })
      .where(eq(features.id, featureId))
      .returning();
    return rows[0] as Feature;
  }

  // Returns a set of feature IDs that have at least one app_feature reference (cannot be deleted)
  async findReferencedIds(ids: string[]): Promise<Set<string>> {
    if (ids.length === 0) return new Set();
    const rows = await this.db
      .select({ id: businessAppFeatures.featureId })
      .from(businessAppFeatures)
      .where(inArray(businessAppFeatures.featureId, ids));
    const referenced = new Set<string>();
    for (const row of rows) {
      if (row.id) referenced.add(row.id);
    }
    return referenced;
  }
}
