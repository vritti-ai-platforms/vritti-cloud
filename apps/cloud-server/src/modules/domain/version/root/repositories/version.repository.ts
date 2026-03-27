import { Injectable } from '@nestjs/common';
import { PrimaryBaseRepository, PrimaryDatabaseService } from '@vritti/api-sdk';
import { eq } from '@vritti/api-sdk/drizzle-orm';
import type { Version } from '@/db/schema';
import {
  appFeatures,
  versions,
  apps,
  featureMicrofrontends,
  featurePermissions,
  features,
  microfrontends,
  roleApps,
  roleFeaturePermissions,
  roles,
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
    const [featureRows, permissionRows, mfRows, featureMfRows, appRows, appFeatureRows, roleRows, rolePermRows, roleAppRows] = await Promise.all([
      this.db.select().from(features).where(eq(features.versionId, versionId)),
      this.db.select().from(featurePermissions).where(eq(featurePermissions.versionId, versionId)),
      this.db.select().from(microfrontends).where(eq(microfrontends.versionId, versionId)),
      this.db.select().from(featureMicrofrontends).where(eq(featureMicrofrontends.versionId, versionId)),
      this.db.select().from(apps).where(eq(apps.versionId, versionId)),
      this.db.select().from(appFeatures).where(eq(appFeatures.versionId, versionId)),
      this.db.select().from(roles).where(eq(roles.versionId, versionId)),
      this.db.select().from(roleFeaturePermissions).where(eq(roleFeaturePermissions.versionId, versionId)),
      this.db.select().from(roleApps).where(eq(roleApps.versionId, versionId)),
    ]);

    // Index microfrontends by ID for junction lookup
    const mfById = new Map(mfRows.map((mf) => [mf.id, mf]));

    // Index feature-microfrontend junction rows by featureId
    const featureMfByFeatureId = new Map<string, typeof featureMfRows>();
    for (const fmf of featureMfRows) {
      const list = featureMfByFeatureId.get(fmf.featureId) ?? [];
      list.push(fmf);
      featureMfByFeatureId.set(fmf.featureId, list);
    }

    // Index permissions by featureId
    const permsByFeatureId = new Map<string, string[]>();
    for (const perm of permissionRows) {
      const list = permsByFeatureId.get(perm.featureId) ?? [];
      list.push(perm.type);
      permsByFeatureId.set(perm.featureId, list);
    }

    // Index features by ID for app and role lookups
    const featureById = new Map(featureRows.map((f) => [f.id, f]));

    // Build features snapshot with platform-keyed microfrontends map
    const snapshotFeatures = featureRows.map((f) => {
      const junctionRows = featureMfByFeatureId.get(f.id) ?? [];
      const mfMap: Record<string, { remoteEntry: string; exposedModule: string; routePrefix: string }> = {};
      for (const jRow of junctionRows) {
        const mf = mfById.get(jRow.microfrontendId);
        if (mf) {
          mfMap[mf.platform] = {
            remoteEntry: mf.remoteEntry,
            exposedModule: jRow.exposedModule,
            routePrefix: jRow.routePrefix,
          };
        }
      }
      return {
        code: f.code,
        name: f.name,
        icon: f.icon,
        permissions: permsByFeatureId.get(f.id) ?? [],
        microfrontends: mfMap,
      };
    });

    // Build apps snapshot — map appFeatures to feature codes
    const featureIdsByAppId = new Map<string, string[]>();
    for (const af of appFeatureRows) {
      const list = featureIdsByAppId.get(af.appId) ?? [];
      list.push(af.featureId);
      featureIdsByAppId.set(af.appId, list);
    }

    const snapshotApps = appRows.map((a) => ({
      code: a.code,
      name: a.name,
      icon: a.icon,
      features: (featureIdsByAppId.get(a.id) ?? [])
        .map((fId) => featureById.get(fId)?.code)
        .filter(Boolean),
    }));

    // Index role-app links by roleId → app codes
    const appById = new Map(appRows.map((a) => [a.id, a]));
    const roleAppCodesByRoleId = new Map<string, string[]>();
    for (const ra of roleAppRows) {
      const app = appById.get(ra.appId);
      if (app) {
        const list = roleAppCodesByRoleId.get(ra.roleId) ?? [];
        list.push(app.code);
        roleAppCodesByRoleId.set(ra.roleId, list);
      }
    }

    // Build roleTemplates snapshot — group role_feature_permissions by role, then by feature code
    const rolePermsByRoleId = new Map<string, Array<{ featureId: string; type: string }>>();
    for (const rp of rolePermRows) {
      const list = rolePermsByRoleId.get(rp.roleId) ?? [];
      list.push({ featureId: rp.featureId, type: rp.type });
      rolePermsByRoleId.set(rp.roleId, list);
    }

    const snapshotRoleTemplates = roleRows.map((r) => {
      const perms = rolePermsByRoleId.get(r.id) ?? [];
      const featurePerms: Record<string, string[]> = {};
      for (const p of perms) {
        const code = featureById.get(p.featureId)?.code;
        if (code) {
          featurePerms[code] = featurePerms[code] ?? [];
          featurePerms[code].push(p.type);
        }
      }
      return {
        name: r.name,
        scope: r.scope,
        apps: roleAppCodesByRoleId.get(r.id) ?? [],
        features: featurePerms,
      };
    });

    return {
      features: snapshotFeatures,
      apps: snapshotApps,
      roleTemplates: snapshotRoleTemplates,
    };
  }
}
