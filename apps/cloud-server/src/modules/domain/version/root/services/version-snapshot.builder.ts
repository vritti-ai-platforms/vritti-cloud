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

// Raw versioned rows fetched for a single version (see VersionRepository.findSnapshotData)
export interface SnapshotData {
  features: Feature[];
  permissions: FeaturePermission[];
  webMicrofrontends: WebMicrofrontend[];
  mobileMicrofrontends: MobileMicrofrontend[];
  apps: App[];
  businessAppFeatures: AppFeature[];
  roleTemplates: RoleTemplate[];
  // Per-platform feature memberships (the role's included features) + the action grants under them
  roleTemplateFeatures: RoleTemplateFeature[];
  roleTemplatePermissions: RoleTemplateFeaturePermission[];
  plans: Plan[];
  // Per-platform feature memberships (the plan's included features) + the action unlocks under them
  planFeatures: PlanFeature[];
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
// WEB microfrontend route — a single remote entry. All non-null: a WEB microfrontend row is
// CHECK-constrained to have remoteEntry set, and the feature↔MF link's module/route are NOT NULL.
export interface SnapshotMicrofrontendWeb {
  code: string;
  name: string;
  remoteEntry: string;
  exposedModule: string;
  routePrefix: string;
}
// MOBILE microfrontend route — per-OS remote entries (android + ios). All non-null: a MOBILE row is
// CHECK-constrained to have both android + ios set, and the link's module/route are NOT NULL.
export interface SnapshotMicrofrontendMobile {
  code: string;
  name: string;
  remoteEntryAndroid: string;
  remoteEntryIos: string;
  exposedModule: string;
  routePrefix: string;
}
// Per-platform microfrontend routes — mirrors the {web?, mobile?} shape used by role grants / plan unlocks.
export interface SnapshotMicrofrontends {
  web?: SnapshotMicrofrontendWeb;
  mobile?: SnapshotMicrofrontendMobile;
}
export interface SnapshotFeature {
  code: string;
  name: string;
  lucideIcon: string;
  sfSymbol: string;
  materialSymbol: string;
  permissions: SnapshotPermission[];
  microfrontends: SnapshotMicrofrontends;
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
  // Stable link to provisioned org roles (the template's code, not its id)
  code: string;
  // featureCode -> { app: appCode, web?: [permCode…], mobile?: [permCode…] } — grants split per platform, app stamped
  features: Record<string, { app: string; web?: string[]; mobile?: string[] }>;
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
  // Feature → its app code (one app per feature within a business) — stamped onto each role grant
  const appCodeByFeatureId = _.mapValues(
    _.keyBy(data.businessAppFeatures, 'featureId'),
    (af) => appById[af.appId]?.code,
  );
  return {
    webMfById: _.keyBy(data.webMicrofrontends, 'id'),
    mobileMfById: _.keyBy(data.mobileMicrofrontends, 'id'),
    featureById: _.keyBy(data.features, 'id'),
    appCodeByFeatureId,
    permissionById: _.keyBy(data.permissions, 'id'),
    businessCodeById,
    businessNameByCode: _.mapValues(_.keyBy(data.businesses, 'code'), (b) => b.name),
    businessCodesByPermissionId,
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
      permissions: buildPermissions(f.id, index),
      microfrontends: buildMicrofrontends(f, index),
    };
  }
  return result;
}

// A role's features: { featureCode: { app, web?: [permCode…], mobile?: [permCode…] } }. Seeded from memberships
// (so a member with zero actions still appears = the View/route gate), then filled with action grants. `app` = the
// feature's owning app code, so core can derive a role's apps without a separate list.
function buildRoleFeatures(
  roleId: string,
  index: SnapshotIndex,
): Record<string, { app: string; web?: string[]; mobile?: string[] }> {
  const featurePerms: Record<string, { app: string; web?: string[]; mobile?: string[] }> = {};
  const bucketFor = (featureId: string, featureCode: string) => {
    let bucket = featurePerms[featureCode];
    if (!bucket) {
      bucket = { app: index.appCodeByFeatureId[featureId] ?? '' };
      featurePerms[featureCode] = bucket;
    }
    return bucket;
  };
  for (const m of index.roleFeaturesByRoleId[roleId] ?? []) {
    const featureCode = index.featureById[m.featureId]?.code;
    if (!featureCode) continue;
    const key = m.platform === 'WEB' ? 'web' : 'mobile';
    const bucket = bucketFor(m.featureId, featureCode);
    if (!bucket[key]) bucket[key] = [];
  }
  for (const rp of index.rolePermsByRoleId[roleId] ?? []) {
    const membership = index.roleFeatureById[rp.roleTemplateFeatureId];
    const perm = index.permissionById[rp.featurePermissionId];
    const featureCode = membership && index.featureById[membership.featureId]?.code;
    if (!featureCode || !perm || !membership) continue;
    const key = membership.platform === 'WEB' ? 'web' : 'mobile';
    const bucket = bucketFor(membership.featureId, featureCode);
    const list = bucket[key] ?? [];
    bucket[key] = list;
    list.push(perm.code);
  }
  return featurePerms;
}

// A plan's unlocked features: { featureCode: { web?: [permCode…], mobile?: [permCode…] } }. Seeded from
// memberships (a member with zero unlocked actions still appears = included/view-only), then filled with unlocks.
function buildPlanUnlockedPermissions(
  planId: string,
  index: SnapshotIndex,
): Record<string, { web?: string[]; mobile?: string[] }> {
  const featurePerms: Record<string, { web?: string[]; mobile?: string[] }> = {};
  for (const m of index.planFeaturesByPlanId[planId] ?? []) {
    const featureCode = index.featureById[m.featureId]?.code;
    if (!featureCode) continue;
    const key = m.platform === 'WEB' ? 'web' : 'mobile';
    const bucket = featurePerms[featureCode] ?? {};
    featurePerms[featureCode] = bucket;
    if (!bucket[key]) bucket[key] = [];
  }
  for (const pfp of index.planPermsByPlanId[planId] ?? []) {
    const membership = index.planFeatureById[pfp.planFeatureId];
    const perm = index.permissionById[pfp.featurePermissionId];
    const featureCode = membership && index.featureById[membership.featureId]?.code;
    if (!featureCode || !perm) continue;
    const key = membership.platform === 'WEB' ? 'web' : 'mobile';
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
      code: r.code,
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
