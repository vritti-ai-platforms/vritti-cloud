import { Injectable } from '@nestjs/common';
import { PrimaryBaseRepository, PrimaryDatabaseService } from '@vritti/api-sdk';
import { and, countDistinct, eq, exists, inArray, type SQL, sql } from '@vritti/api-sdk/drizzle-orm';
import type { Feature } from '@/db/schema';
import { appFeatures, apps, featureMicrofrontends, featurePermissions, features, microfrontends } from '@/db/schema';

export type FeatureTableRow = Feature & {
  permissions: string[];
  platforms: string[];
  appFeatureCount: number;
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

  // Counts how many app_features reference a given feature
  // Returns all features for a version with permissions — single query for export
  async findAllForExport(
    versionId: string,
  ): Promise<{ code: string; name: string; icon: string; description: string | null; permissions: string[] }[]> {
    const rows = await this.db
      .select({
        code: features.code,
        name: features.name,
        icon: features.icon,
        description: features.description,
        permissions: sql<string[]>`array_remove(array_agg(distinct ${featurePermissions.type}), null)`.mapWith({
          mapFromDriverValue: (value: string) => (value === '{}' || !value ? [] : value.slice(1, -1).split(',')),
        }),
      })
      .from(features)
      .leftJoin(featurePermissions, eq(featurePermissions.featureId, features.id))
      .where(eq(features.versionId, versionId))
      .groupBy(features.id)
      .orderBy(features.sortOrder);
    return rows as { code: string; name: string; icon: string; description: string | null; permissions: string[] }[];
  }

  // Returns all features for a version with assignment status for a given app (excludes features with no permissions)
  async findAllWithAssignment(
    appId: string,
    options: {
      where?: SQL;
      orderBy?: SQL[];
      limit: number;
      offset: number;
    },
  ): Promise<{
    result: Array<{ featureId: string; code: string; name: string; icon: string; isAssigned: boolean }>;
    count: number;
  }> {
    const hasPermissions = exists(
      this.database.drizzleClient
        .select({ one: sql`1` })
        .from(featurePermissions)
        .where(eq(featurePermissions.featureId, features.id)),
    );
    return this.findAllAndCount({
      select: {
        featureId: features.id,
        code: features.code,
        name: features.name,
        icon: features.icon,
        isAssigned: sql<boolean>`${appFeatures.id} is not null`,
      },
      leftJoin: { table: appFeatures, on: and(eq(appFeatures.featureId, features.id), eq(appFeatures.appId, appId)) },
      ...options,
      where: and(options.where, hasPermissions),
    });
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
        permissions: sql<string[]>`array_remove(array_agg(distinct ${featurePermissions.type}), null)`.mapWith({
          mapFromDriverValue: (value: string) => (value === '{}' || !value ? [] : value.slice(1, -1).split(',')),
        }),
        platforms: sql<string[]>`array_remove(array_agg(distinct ${microfrontends.platform}), null)`.mapWith({
          mapFromDriverValue: (value: string) => (value === '{}' || !value ? [] : value.slice(1, -1).split(',')),
        }),
        appFeatureCount: countDistinct(appFeatures.id),
      },
      leftJoins: [
        { table: featurePermissions, on: eq(featurePermissions.featureId, features.id) },
        { table: featureMicrofrontends, on: eq(featureMicrofrontends.featureId, features.id) },
        { table: microfrontends, on: eq(microfrontends.id, featureMicrofrontends.microfrontendId) },
        { table: appFeatures, on: eq(appFeatures.featureId, features.id) },
      ],
      groupBy: [features.id],
      where: options.where,
      orderBy: options.orderBy,
      limit: options.limit,
      offset: options.offset,
    });
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
