import {
  type BusinessVocabulary,
  type FeatureUnlocks,
  type PlatformBucket,
  type PlatformCodes,
  SNAPSHOT_SCHEMA_VERSION,
  type SnapshotBusiness,
  type SnapshotFeature,
  type SnapshotMicrofrontends,
  type SnapshotPermission,
  type VersionSnapshot,
} from '@vritti/api-sdk/catalog-resolver';
import _ from '@vritti/api-sdk/lodash';
import type {
  App,
  AppFeature,
  Feature,
  FeaturePermission,
  MobileMicrofrontend,
  Plan,
  PlanFeature,
  PlanFeaturePermission,
  RoleTemplate,
  RoleTemplateFeature,
  RoleTemplateFeaturePermission,
  WebMicrofrontend,
} from '@/db/schema';

export interface SnapshotData {
  features: Feature[];
  permissions: FeaturePermission[];
  webMicrofrontends: WebMicrofrontend[];
  mobileMicrofrontends: MobileMicrofrontend[];
  apps: App[];
  businessAppFeatures: AppFeature[];
  roleTemplates: RoleTemplate[];
  roleTemplateFeatures: RoleTemplateFeature[];
  roleTemplatePermissions: RoleTemplateFeaturePermission[];
  plans: Plan[];
  planFeatures: PlanFeature[];
  planFeaturePermissions: PlanFeaturePermission[];
  businesses: Array<{ id: string; code: string; name: string; vocabulary: BusinessVocabulary | null }>;
  permissionBusinesses: Array<{ featurePermissionId: string; businessId: string }>;
  permissionDependencies: Array<{ permissionId: string; dependsOnId: string }>;
}

export type {
  SnapshotApp,
  SnapshotBusiness,
  SnapshotFeature,
  SnapshotMicrofrontendMobile,
  SnapshotMicrofrontends,
  SnapshotMicrofrontendWeb,
  SnapshotPermission,
  SnapshotPlan,
  SnapshotRoleTemplate,
  VersionSnapshot,
} from '@vritti/api-sdk/catalog-resolver';

// Pre-computed lookups derived once from the raw rows
function buildIndex(data: SnapshotData) {
  const businessCodeById = _.mapValues(_.keyBy(data.businesses, 'id'), (b) => b.code);
  const businessCodesByPermissionId = _.mapValues(_.groupBy(data.permissionBusinesses, 'featurePermissionId'), (rows) =>
    rows.map((r) => businessCodeById[r.businessId]).filter((c): c is string => Boolean(c)),
  );
  const permissionById = _.keyBy(data.permissions, 'id');
  // permissionId -> its prerequisite sibling CODES (same-feature edges only)
  const dependsOnCodesByPermissionId: Record<string, string[]> = {};
  for (const edge of data.permissionDependencies) {
    const dependent = permissionById[edge.permissionId];
    const prereq = permissionById[edge.dependsOnId];
    if (!dependent || !prereq || prereq.featureId !== dependent.featureId) continue;
    const list = dependsOnCodesByPermissionId[edge.permissionId] ?? [];
    list.push(prereq.code);
    dependsOnCodesByPermissionId[edge.permissionId] = list;
  }
  return {
    webMfById: _.keyBy(data.webMicrofrontends, 'id'),
    mobileMfById: _.keyBy(data.mobileMicrofrontends, 'id'),
    featureById: _.keyBy(data.features, 'id'),
    permissionById,
    businessCodeById,
    businessNameByCode: _.mapValues(_.keyBy(data.businesses, 'code'), (b) => b.name),
    businessVocabularyByCode: _.mapValues(_.keyBy(data.businesses, 'code'), (b) => b.vocabulary),
    businessCodesByPermissionId,
    dependsOnCodesByPermissionId,
    permsByFeatureId: _.groupBy(data.permissions, 'featureId'),
    appFeaturesByAppId: _.groupBy(data.businessAppFeatures, 'appId'),
    rolePermsByRoleId: _.groupBy(data.roleTemplatePermissions, 'roleTemplateId'),
    planPermsByPlanId: _.groupBy(data.planFeaturePermissions, 'planId'),
    roleFeatureById: _.keyBy(data.roleTemplateFeatures, 'id'),
    roleFeaturesByRoleId: _.groupBy(data.roleTemplateFeatures, 'roleTemplateId'),
    planFeatureById: _.keyBy(data.planFeatures, 'id'),
    planFeaturesByPlanId: _.groupBy(data.planFeatures, 'planId'),
  };
}

type SnapshotIndex = ReturnType<typeof buildIndex>;

// A feature's microfrontend routes per platform, built from its own web/mobile link columns
function buildMicrofrontends(feature: Feature, index: SnapshotIndex): SnapshotMicrofrontends {
  const mf: SnapshotMicrofrontends = {};
  if (feature.webMfId && feature.webExposedModule && feature.webRoutePrefix) {
    const w = index.webMfById[feature.webMfId];
    if (w)
      mf.web = {
        code: w.code,
        name: w.name,
        remoteEntry: w.remoteEntry,
        exposedModule: feature.webExposedModule,
        routePrefix: feature.webRoutePrefix,
      };
  }
  if (feature.mobileMfId && feature.mobileExposedModule && feature.mobileRoutePrefix) {
    const m = index.mobileMfById[feature.mobileMfId];
    if (m)
      mf.mobile = {
        code: m.code,
        name: m.name,
        remoteEntryAndroid: m.remoteEntryAndroid,
        remoteEntryIos: m.remoteEntryIos,
        exposedModule: feature.mobileExposedModule,
        routePrefix: feature.mobileRoutePrefix,
      };
  }
  return mf;
}

// A feature's scoped permissions (global ones carry no businesses; others list the business codes they apply to)
function buildPermissions(featureId: string, index: SnapshotIndex): SnapshotPermission[] {
  return (index.permsByFeatureId[featureId] ?? []).map((p) => ({
    code: p.code,
    label: p.label,
    isGlobal: p.isGlobal,
    businesses: p.isGlobal ? [] : (index.businessCodesByPermissionId[p.id] ?? []),
    dependsOn: index.dependsOnCodesByPermissionId[p.id] ?? [],
  }));
}

// Feature dictionary keyed by code
function buildFeatures(data: SnapshotData, index: SnapshotIndex): Record<string, SnapshotFeature> {
  const result: Record<string, SnapshotFeature> = {};
  for (const f of data.features) {
    result[f.code] = {
      code: f.code,
      name: f.name,
      lucideIcon: f.lucideIcon,
      sfSymbol: f.sfSymbol,
      materialSymbol: f.materialSymbol,
      scope: f.scope,
      applicableSiteTypes: f.applicableSiteTypes,
      permissions: buildPermissions(f.id, index),
      microfrontends: buildMicrofrontends(f, index),
    };
  }
  return result;
}

// Returns the feature's per-platform bucket in the unlocks map, creating it on first access
function bucketFor(unlocks: FeatureUnlocks, featureCode: string): PlatformCodes {
  let bucket = unlocks[featureCode];
  if (!bucket) {
    bucket = {};
    unlocks[featureCode] = bucket;
  }
  return bucket;
}

// Ensures the platform key exists on the bucket (membership marker) and appends the code once if given
function addPlatformCode(bucket: PlatformCodes, key: PlatformBucket, code?: string): void {
  const list = bucket[key] ?? [];
  bucket[key] = list;
  if (code && !list.includes(code)) list.push(code);
}

// A role's features seeded from memberships (a member with zero actions still appears = View/route gate), then filled with action grants
function buildRoleFeatures(roleId: string, index: SnapshotIndex): FeatureUnlocks {
  const featurePerms: FeatureUnlocks = {};
  for (const m of index.roleFeaturesByRoleId[roleId] ?? []) {
    const featureCode = index.featureById[m.featureId]?.code;
    if (!featureCode) continue;
    addPlatformCode(bucketFor(featurePerms, featureCode), m.platform === 'WEB' ? 'web' : 'mobile');
  }
  for (const rp of index.rolePermsByRoleId[roleId] ?? []) {
    const membership = index.roleFeatureById[rp.roleTemplateFeatureId];
    const perm = index.permissionById[rp.featurePermissionId];
    const featureCode = membership && index.featureById[membership.featureId]?.code;
    if (!featureCode || !perm || !membership) continue;
    addPlatformCode(bucketFor(featurePerms, featureCode), membership.platform === 'WEB' ? 'web' : 'mobile', perm.code);
  }
  return featurePerms;
}

// A plan's unlocked features seeded from memberships (a member with zero unlocked actions still appears = included/view-only), then filled with unlocks
function buildPlanUnlockedPermissions(planId: string, index: SnapshotIndex): FeatureUnlocks {
  const featurePerms: FeatureUnlocks = {};
  for (const m of index.planFeaturesByPlanId[planId] ?? []) {
    const featureCode = index.featureById[m.featureId]?.code;
    if (!featureCode) continue;
    addPlatformCode(bucketFor(featurePerms, featureCode), m.platform === 'WEB' ? 'web' : 'mobile');
  }
  for (const pfp of index.planPermsByPlanId[planId] ?? []) {
    const membership = index.planFeatureById[pfp.planFeatureId];
    const perm = index.permissionById[pfp.featurePermissionId];
    const featureCode = membership && index.featureById[membership.featureId]?.code;
    if (!featureCode || !perm) continue;
    addPlatformCode(bucketFor(featurePerms, featureCode), membership.platform === 'WEB' ? 'web' : 'mobile', perm.code);
  }
  return featurePerms;
}

// Per-business sections (apps + role templates + plans) grouped by business code
function buildBusinesses(data: SnapshotData, index: SnapshotIndex): Record<string, SnapshotBusiness> {
  const result: Record<string, SnapshotBusiness> = {};
  const ensure = (code: string): SnapshotBusiness => {
    if (!result[code]) {
      const vocabulary = index.businessVocabularyByCode[code];
      result[code] = {
        name: index.businessNameByCode[code],
        ...(vocabulary ? { vocabulary } : {}),
        apps: [],
        roleTemplates: {},
        plans: {},
      };
    }
    return result[code];
  };

  for (const a of data.apps) {
    const code = index.businessCodeById[a.businessId];
    if (!code) continue;
    ensure(code).apps.push({
      code: a.code,
      name: a.name,
      icon: a.icon,
      sortOrder: a.sortOrder,
      features: (index.appFeaturesByAppId[a.id] ?? [])
        .map((af) => index.featureById[af.featureId]?.code)
        .filter((c): c is string => Boolean(c)),
    });
  }

  for (const r of data.roleTemplates) {
    const code = index.businessCodeById[r.businessId];
    if (!code) continue;
    ensure(code).roleTemplates[r.code] = {
      name: r.name,
      code: r.code,
      scope: r.scope,
      siteType: r.siteType,
      features: buildRoleFeatures(r.id, index),
    };
  }

  for (const p of data.plans) {
    const code = index.businessCodeById[p.businessId];
    if (!code) continue;
    ensure(code).plans[p.code] = {
      code: p.code,
      name: p.name,
      isCustom: p.isCustom,
      maxSites: p.maxSites ?? null,
      unlockedPermissions: buildPlanUnlockedPermissions(p.id, index),
    };
  }

  return result;
}

// Assembles the version snapshot document from the raw versioned rows
export function buildVersionSnapshot(data: SnapshotData): VersionSnapshot {
  const index = buildIndex(data);
  return {
    schemaVersion: SNAPSHOT_SCHEMA_VERSION,
    features: buildFeatures(data, index),
    businesses: buildBusinesses(data, index),
  };
}
