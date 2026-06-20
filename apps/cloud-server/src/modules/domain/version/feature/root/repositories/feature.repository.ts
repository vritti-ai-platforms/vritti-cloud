import { Injectable } from '@nestjs/common';
import {
  type FindForSelectConfig,
  PrimaryBaseRepository,
  PrimaryDatabaseService,
  type SelectQueryResult,
} from '@vritti/api-sdk';
import { countDistinct, eq, inArray, type SQL, sql } from '@vritti/api-sdk/drizzle-orm';
import type { Feature } from '@/db/schema';
import {
  appFeatures,
  apps,
  featureMicrofrontends,
  featurePermissions,
  features,
  microfrontends,
  permissionBusinesses,
} from '@/db/schema';

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
  ): Promise<{ code: string; name: string; icon: string; description: string | null }[]> {
    const rows = await this.db
      .select({
        code: features.code,
        name: features.name,
        icon: features.icon,
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
      .from(appFeatures)
      .where(eq(appFeatures.featureId, featureId));
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
        icon: features.icon,
        isActive: features.isActive,
        sortOrder: features.sortOrder,
        createdAt: features.createdAt,
        updatedAt: features.updatedAt,
        permissions: sql<string[]>`array_remove(array_agg(distinct ${featurePermissions.code}), null)`.mapWith({
          mapFromDriverValue: (value: unknown) =>
            Array.isArray(value) ? value : value === '{}' || !value ? [] : String(value).slice(1, -1).split(','),
        }),
        platforms: sql<string[]>`array_remove(array_agg(distinct ${microfrontends.platform}), null)`.mapWith({
          mapFromDriverValue: (value: unknown) =>
            Array.isArray(value) ? value : value === '{}' || !value ? [] : String(value).slice(1, -1).split(','),
        }),
        appFeatureCount: countDistinct(appFeatures.id),
        businessCount: countDistinct(apps.businessId),
      },
      leftJoins: [
        { table: featurePermissions, on: eq(featurePermissions.featureId, features.id) },
        { table: featureMicrofrontends, on: eq(featureMicrofrontends.featureId, features.id) },
        { table: microfrontends, on: eq(microfrontends.id, featureMicrofrontends.microfrontendId) },
        { table: appFeatures, on: eq(appFeatures.featureId, features.id) },
        { table: apps, on: eq(apps.id, appFeatures.appId) },
      ],
      groupBy: [features.id],
      where: options.where,
      orderBy: options.orderBy,
      limit: options.limit,
      offset: options.offset,
    });
  }

  // Returns feature select options available to add to a business: features that have a permission applicable to
  // the business (global or business-linked) and are not already assigned to any of the business's apps
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
        select 1 from ${appFeatures} af
        join ${apps} a on a.id = af.app_id
        where af.feature_id = ${features.id} and a.business_id = ${businessId}
      )`;
    return this.findForSelect({ ...config, conditions: [...(config.conditions ?? []), available] });
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
}
