import { Injectable } from '@nestjs/common';
import { PrimaryBaseRepository, PrimaryDatabaseService } from '@vritti/api-sdk';
import { eq } from '@vritti/api-sdk/drizzle-orm';
import _ from '@vritti/api-sdk/lodash';
import type { Version } from '@/db/schema';
import {
  appFeatures,
  apps,
  featureMicrofrontends,
  featurePermissions,
  features,
  microfrontends,
  roleTemplateApps,
  roleTemplateFeaturePermissions,
  roleTemplates,
  versions,
} from '@/db/schema';

@Injectable()
export class VersionRepository extends PrimaryBaseRepository<typeof versions> {
  constructor(database: PrimaryDatabaseService) {
    super(database, versions);
  }

  // Finds a version by its unique identifier
  async findById(id: string): Promise<Version | undefined> {
    return this.model.findFirst({ where: { id } });
  }

  // Finds a version by its unique version string
  async findByVersion(version: string): Promise<Version | undefined> {
    return this.model.findFirst({ where: { version } });
  }

  // Returns all versions ordered by creation date descending
  async findAllForTable(): Promise<{ result: Version[]; count: number }> {
    const result = await this.model.findMany({ orderBy: { createdAt: 'desc' } });
    return { result, count: result.length };
  }

  // Builds a snapshot from all versioned tables for the given version
  async buildSnapshot(versionId: string): Promise<Record<string, unknown>> {
    // Fetch all versioned data in parallel
    const [
      featureRows,
      permissionRows,
      mfRows,
      featureMfRows,
      appRows,
      appFeatureRows,
      roleRows,
      rolePermRows,
      roleAppRows,
    ] = await Promise.all([
      this.db.select().from(features).where(eq(features.versionId, versionId)),
      this.db.select().from(featurePermissions).where(eq(featurePermissions.versionId, versionId)),
      this.db.select().from(microfrontends).where(eq(microfrontends.versionId, versionId)),
      this.db.select().from(featureMicrofrontends).where(eq(featureMicrofrontends.versionId, versionId)),
      this.db.select().from(apps).where(eq(apps.versionId, versionId)),
      this.db.select().from(appFeatures).where(eq(appFeatures.versionId, versionId)),
      this.db.select().from(roleTemplates).where(eq(roleTemplates.versionId, versionId)),
      this.db
        .select()
        .from(roleTemplateFeaturePermissions)
        .where(eq(roleTemplateFeaturePermissions.versionId, versionId)),
      this.db.select().from(roleTemplateApps).where(eq(roleTemplateApps.versionId, versionId)),
    ]);

    // Index lookup tables
    const mfById = _.keyBy(mfRows, 'id');
    const featureById = _.keyBy(featureRows, 'id');
    const appById = _.keyBy(appRows, 'id');

    // Group junction/relation rows by parent ID
    const featureMfByFeatureId = _.groupBy(featureMfRows, 'featureId');
    const permsByFeatureId = _.mapValues(_.groupBy(permissionRows, 'featureId'), (rows) => rows.map((r) => r.type));
    const appFeaturesByAppId = _.groupBy(appFeatureRows, 'appId');
    const roleAppsByRoleId = _.groupBy(roleAppRows, 'roleTemplateId');
    const rolePermsByRoleId = _.groupBy(rolePermRows, 'roleTemplateId');

    // Build features snapshot
    const snapshotFeatures = featureRows.map((f) => {
      const mfMap: Record<string, { remoteEntry: string; exposedModule: string; routePrefix: string }> = {};
      for (const jRow of featureMfByFeatureId[f.id] ?? []) {
        const mf = mfById[jRow.microfrontendId];
        if (mf) {
          mfMap[mf.platform] = { remoteEntry: mf.remoteEntry, exposedModule: jRow.exposedModule, routePrefix: jRow.routePrefix };
        }
      }
      return {
        code: f.code,
        name: f.name,
        icon: f.icon,
        permissions: permsByFeatureId[f.id] ?? [],
        microfrontends: mfMap,
      };
    });

    // Build apps snapshot
    const snapshotApps = appRows.map((a) => ({
      code: a.code,
      name: a.name,
      icon: a.icon,
      features: (appFeaturesByAppId[a.id] ?? []).map((af) => featureById[af.featureId]?.code).filter(Boolean),
    }));

    // Build role templates snapshot
    const snapshotRoleTemplates = roleRows.map((r) => {
      const appCodes = (roleAppsByRoleId[r.id] ?? []).map((ra) => appById[ra.appId]?.code).filter(Boolean);
      const featurePerms: Record<string, string[]> = {};
      for (const rp of rolePermsByRoleId[r.id] ?? []) {
        const code = featureById[rp.featureId]?.code;
        if (code) {
          if (!featurePerms[code]) featurePerms[code] = [];
          featurePerms[code].push(rp.type);
        }
      }
      return { name: r.name, scope: r.scope, apps: appCodes, features: featurePerms };
    });

    return { features: snapshotFeatures, apps: snapshotApps, roleTemplates: snapshotRoleTemplates };
  }
}
