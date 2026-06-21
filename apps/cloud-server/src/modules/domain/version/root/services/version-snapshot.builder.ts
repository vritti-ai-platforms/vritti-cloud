import _ from '@vritti/api-sdk/lodash';
import type {
  App,
  AppFeature,
  Feature,
  FeatureMicrofrontend,
  FeaturePermission,
  Microfrontend,
  Plan,
  PlanFeaturePermission,
  RoleTemplate,
  RoleTemplateFeaturePermission,
} from '@/db/schema';

// Raw versioned rows fetched for a single version (see VersionRepository.findSnapshotData)
export interface SnapshotData {
  features: Feature[];
  permissions: FeaturePermission[];
  microfrontends: Microfrontend[];
  featureMicrofrontends: FeatureMicrofrontend[];
  apps: App[];
  appFeatures: AppFeature[];
  roleTemplates: RoleTemplate[];
  roleTemplatePermissions: RoleTemplateFeaturePermission[];
  plans: Plan[];
  planFeaturePermissions: PlanFeaturePermission[];
  businesses: Array<{ id: string; code: string; name: string }>;
  permissionBusinesses: Array<{ featurePermissionId: string; businessId: string }>;
}

// Output document shape — what gets stored in versions.snapshot
export interface SnapshotPermission {
  code: string;
  label: string;
  isGlobal: boolean;
  businesses: string[];
}
export interface SnapshotMicrofrontend {
  code: string;
  name: string;
  remoteEntry?: string | null;
  remoteEntryAndroid?: string | null;
  remoteEntryIos?: string | null;
  exposedModule: string | null;
  routePrefix: string | null;
}
export interface SnapshotFeature {
  code: string;
  name: string;
  icon: string;
  sfSymbol: string;
  materialSymbol: string;
  permissions: SnapshotPermission[];
  microfrontends: Record<string, SnapshotMicrofrontend>;
}
export interface SnapshotApp {
  code: string;
  name: string;
  icon: string;
  sortOrder: number;
  features: string[];
}
export interface SnapshotRoleTemplate {
  name: string;
  scope: string;
  sourceRoleId: string;
  apps: string[];
  // featureCode -> { web?: [permCode…], mobile?: [permCode…] } — grants split per platform
  features: Record<string, { web?: string[]; mobile?: string[] }>;
}
// A plan is a lock overlay: the feature-permissions it UNLOCKS per platform (everything else renders locked).
// Apps are derived from these. Shape mirrors role grants: featureCode -> { web?: [permCode…], mobile?: [permCode…] }.
export interface SnapshotPlan {
  code: string;
  name: string;
  isCustom: boolean;
  maxBusinessUnits: number | null;
  unlockedPermissions: Record<string, { web?: string[]; mobile?: string[] }>;
}
export interface SnapshotBusiness {
  name: string;
  apps: SnapshotApp[];
  roleTemplates: SnapshotRoleTemplate[];
  plans: Record<string, SnapshotPlan>;
}
export interface VersionSnapshot {
  features: Record<string, SnapshotFeature>;
  businesses: Record<string, SnapshotBusiness>;
}

// Pre-computed lookups derived once from the raw rows
function buildIndex(data: SnapshotData) {
  const businessCodeById = _.mapValues(_.keyBy(data.businesses, 'id'), (b) => b.code);
  const businessCodesByPermissionId = _.mapValues(_.groupBy(data.permissionBusinesses, 'featurePermissionId'), (rows) =>
    rows.map((r) => businessCodeById[r.businessId]).filter((c): c is string => Boolean(c)),
  );
  const appById = _.keyBy(data.apps, 'id');
  // Feature → its app code (one app per feature within a business) — used to derive a role's apps from its grants
  const appCodeByFeatureId = _.mapValues(_.keyBy(data.appFeatures, 'featureId'), (af) => appById[af.appId]?.code);
  return {
    mfById: _.keyBy(data.microfrontends, 'id'),
    featureById: _.keyBy(data.features, 'id'),
    appById,
    appCodeByFeatureId,
    permissionById: _.keyBy(data.permissions, 'id'),
    businessCodeById,
    businessNameByCode: _.mapValues(_.keyBy(data.businesses, 'code'), (b) => b.name),
    businessCodesByPermissionId,
    featureMfByFeatureId: _.groupBy(data.featureMicrofrontends, 'featureId'),
    permsByFeatureId: _.groupBy(data.permissions, 'featureId'),
    appFeaturesByAppId: _.groupBy(data.appFeatures, 'appId'),
    rolePermsByRoleId: _.groupBy(data.roleTemplatePermissions, 'roleTemplateId'),
    planPermsByPlanId: _.groupBy(data.planFeaturePermissions, 'planId'),
  };
}

// A role's apps, derived from the features its grants touch (one app per feature within a business)
function buildRoleApps(roleId: string, index: SnapshotIndex): string[] {
  const codes = new Set<string>();
  for (const rp of index.rolePermsByRoleId[roleId] ?? []) {
    const featureId = index.permissionById[rp.featurePermissionId]?.featureId;
    const appCode = featureId && index.appCodeByFeatureId[featureId];
    if (appCode) codes.add(appCode);
  }
  return [...codes];
}
type SnapshotIndex = ReturnType<typeof buildIndex>;

// A feature's microfrontend routes per platform (WEB carries remoteEntry; MOBILE carries the android/ios entries)
function buildMicrofrontends(featureId: string, index: SnapshotIndex): SnapshotFeature['microfrontends'] {
  const mfMap: SnapshotFeature['microfrontends'] = {};
  for (const link of index.featureMfByFeatureId[featureId] ?? []) {
    const mf = index.mfById[link.microfrontendId];
    if (!mf) continue;
    mfMap[mf.platform] =
      mf.platform === 'MOBILE'
        ? {
            code: mf.code,
            name: mf.name,
            remoteEntryAndroid: mf.remoteEntryAndroid,
            remoteEntryIos: mf.remoteEntryIos,
            exposedModule: link.exposedModule,
            routePrefix: link.routePrefix,
          }
        : {
            code: mf.code,
            name: mf.name,
            remoteEntry: mf.remoteEntry,
            exposedModule: link.exposedModule,
            routePrefix: link.routePrefix,
          };
  }
  return mfMap;
}

// A feature's scoped permissions (global ones carry no businesses; others list the business codes they apply to)
function buildPermissions(featureId: string, index: SnapshotIndex): SnapshotPermission[] {
  return (index.permsByFeatureId[featureId] ?? []).map((p) => ({
    code: p.code,
    label: p.label,
    isGlobal: p.isGlobal,
    businesses: p.isGlobal ? [] : (index.businessCodesByPermissionId[p.id] ?? []),
  }));
}

// Feature dictionary keyed by code
function buildFeatures(data: SnapshotData, index: SnapshotIndex): Record<string, SnapshotFeature> {
  const result: Record<string, SnapshotFeature> = {};
  for (const f of data.features) {
    result[f.code] = {
      code: f.code,
      name: f.name,
      icon: f.icon,
      sfSymbol: f.sfSymbol,
      materialSymbol: f.materialSymbol,
      permissions: buildPermissions(f.id, index),
      microfrontends: buildMicrofrontends(f.id, index),
    };
  }
  return result;
}

// A role's grants: { featureCode: [permissionCode...] }
function buildRoleFeatures(
  roleId: string,
  index: SnapshotIndex,
): Record<string, { web?: string[]; mobile?: string[] }> {
  const featurePerms: Record<string, { web?: string[]; mobile?: string[] }> = {};
  for (const rp of index.rolePermsByRoleId[roleId] ?? []) {
    const perm = index.permissionById[rp.featurePermissionId];
    const featureCode = perm && index.featureById[perm.featureId]?.code;
    if (!featureCode) continue;
    const key = rp.platform === 'WEB' ? 'web' : 'mobile';
    const bucket = featurePerms[featureCode] ?? {};
    featurePerms[featureCode] = bucket;
    const list = bucket[key] ?? [];
    bucket[key] = list;
    list.push(perm.code);
  }
  return featurePerms;
}

// A plan's unlocked feature-permissions: { featureCode: [permissionCode...] }
function buildPlanUnlockedPermissions(
  planId: string,
  index: SnapshotIndex,
): Record<string, { web?: string[]; mobile?: string[] }> {
  const featurePerms: Record<string, { web?: string[]; mobile?: string[] }> = {};
  for (const pfp of index.planPermsByPlanId[planId] ?? []) {
    const perm = index.permissionById[pfp.featurePermissionId];
    const featureCode = perm && index.featureById[perm.featureId]?.code;
    if (!featureCode) continue;
    const key = pfp.platform === 'WEB' ? 'web' : 'mobile';
    const bucket = featurePerms[featureCode] ?? {};
    featurePerms[featureCode] = bucket;
    const list = bucket[key] ?? [];
    bucket[key] = list;
    list.push(perm.code);
  }
  return featurePerms;
}

// Per-business sections (apps + role templates + plans) grouped by business code
function buildBusinesses(data: SnapshotData, index: SnapshotIndex): Record<string, SnapshotBusiness> {
  const result: Record<string, SnapshotBusiness> = {};
  const ensure = (code: string): SnapshotBusiness => {
    if (!result[code]) {
      result[code] = { name: index.businessNameByCode[code], apps: [], roleTemplates: [], plans: {} };
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
    ensure(code).roleTemplates.push({
      name: r.name,
      scope: r.scope,
      sourceRoleId: r.id,
      apps: buildRoleApps(r.id, index),
      features: buildRoleFeatures(r.id, index),
    });
  }

  for (const p of data.plans) {
    const code = index.businessCodeById[p.businessId];
    if (!code) continue;
    ensure(code).plans[p.code] = {
      code: p.code,
      name: p.name,
      isCustom: p.isCustom,
      maxBusinessUnits: p.maxBusinessUnits ?? null,
      unlockedPermissions: buildPlanUnlockedPermissions(p.id, index),
    };
  }

  return result;
}

// Assembles the version snapshot document from the raw versioned rows
export function buildVersionSnapshot(data: SnapshotData): VersionSnapshot {
  const index = buildIndex(data);
  return {
    features: buildFeatures(data, index),
    businesses: buildBusinesses(data, index),
  };
}
