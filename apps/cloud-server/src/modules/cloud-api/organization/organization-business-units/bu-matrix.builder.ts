import type { AppPlatform, BuUnlocks } from '@/db/schema';
import type { PlanMembership } from '@/modules/domain/plan/repositories/plan-feature.repository';
import type {
  AvailablePlanApp,
  AvailablePlanFeature,
} from '@/modules/domain/plan/repositories/plan-feature-permission.repository';

// A single BU's allow-list (the value stored under buUnlocks[buId]) — code-keyed, version-portable
export type BuFeatureUnlocks = BuUnlocks[string];

// An app (ceiling) plus the BU's current memberships — identical shape to the plan matrix, so the UI is shared
export interface BuAppWithMemberships extends AvailablePlanApp {
  memberships: PlanMembership[];
}

// Per-feature code↔id maps, so we can bridge the matrix (id-based) and storage (code-based)
interface FeatureIndexEntry {
  id: string;
  code: string;
  permIdByCode: Map<string, string>;
  permCodeById: Map<string, string>;
}

// Builds the BU matrix. The plan is the ceiling: only plan-unlocked apps/features/permissions are shown, and the
// BU toggles a subset within it. An absent BU (buUnlocks undefined) inherits the full plan (everything checked).
export function buildBuMatrix(
  apps: AvailablePlanApp[],
  planMemberships: PlanMembership[],
  buUnlocks: BuFeatureUnlocks | undefined,
): { apps: BuAppWithMemberships[] } {
  // Plan ceiling per feature: which platforms + permissions the plan unlocks (the BU can't exceed this)
  const planByFeature = new Map<string, { platforms: Set<AppPlatform>; perms: Set<string> }>();
  for (const m of planMemberships) {
    let entry = planByFeature.get(m.featureId);
    if (!entry) {
      entry = { platforms: new Set(), perms: new Set() };
      planByFeature.set(m.featureId, entry);
    }
    entry.platforms.add(m.platform);
    for (const p of m.permissions) entry.perms.add(p);
  }

  // Restrict the catalog to the plan ceiling — drop features/permissions/platforms the plan never unlocked
  const ceilingApps: AvailablePlanApp[] = [];
  for (const app of apps) {
    const features: AvailablePlanFeature[] = [];
    for (const feature of app.features) {
      const ceiling = planByFeature.get(feature.id);
      if (!ceiling) continue;
      features.push({
        ...feature,
        platforms: feature.platforms.filter((pl) => ceiling.platforms.has(pl)),
        permissions: feature.permissions.filter((p) => ceiling.perms.has(p.featurePermissionId)),
      });
    }
    if (features.length > 0) ceilingApps.push({ ...app, features });
  }

  // BU selection: absent ⇒ inherit the full plan; present ⇒ convert the stored codes back to ids for the UI
  const memberships = buUnlocks === undefined ? planMemberships : buUnlocksToMemberships(buUnlocks, apps);

  // Nest each membership under its owning app (feature → app)
  const appIdByFeatureId = new Map<string, string>();
  for (const app of ceilingApps) for (const f of app.features) appIdByFeatureId.set(f.id, app.id);
  const byApp = new Map<string, PlanMembership[]>();
  for (const m of memberships) {
    const appId = appIdByFeatureId.get(m.featureId);
    if (!appId) continue;
    const list = byApp.get(appId) ?? [];
    list.push(m);
    byApp.set(appId, list);
  }

  return { apps: ceilingApps.map((app) => ({ ...app, memberships: byApp.get(app.id) ?? [] })) };
}

// Converts id-based matrix memberships into the code-keyed allow-list stored on the org (for PUT)
export function membershipsToBuUnlocks(memberships: PlanMembership[], apps: AvailablePlanApp[]): BuFeatureUnlocks {
  const { byId } = buildFeatureIndex(apps);
  const out: BuFeatureUnlocks = {};
  for (const m of memberships) {
    const feature = byId.get(m.featureId);
    if (!feature) continue;
    const key = m.platform === 'WEB' ? 'web' : 'mobile';
    const codes = m.permissions.map((id) => feature.permCodeById.get(id)).filter((c): c is string => !!c);
    const entry = out[feature.code] ?? {};
    entry[key] = codes;
    out[feature.code] = entry;
  }
  return out;
}

// Converts the stored code-keyed allow-list back into id-based memberships for the matrix UI
function buUnlocksToMemberships(buUnlocks: BuFeatureUnlocks, apps: AvailablePlanApp[]): PlanMembership[] {
  const { byCode } = buildFeatureIndex(apps);
  const out: PlanMembership[] = [];
  for (const [featureCode, platforms] of Object.entries(buUnlocks)) {
    const feature = byCode.get(featureCode);
    if (!feature) continue;
    for (const [key, platform] of [
      ['web', 'WEB'],
      ['mobile', 'MOBILE'],
    ] as const) {
      const codes = platforms[key];
      if (codes === undefined) continue;
      const ids = codes.map((c) => feature.permIdByCode.get(c)).filter((id): id is string => !!id);
      out.push({ featureId: feature.id, platform, permissions: ids });
    }
  }
  return out;
}

// Builds feature code↔id + permission code↔id lookup maps from the available-apps catalog
function buildFeatureIndex(apps: AvailablePlanApp[]): {
  byCode: Map<string, FeatureIndexEntry>;
  byId: Map<string, FeatureIndexEntry>;
} {
  const byCode = new Map<string, FeatureIndexEntry>();
  const byId = new Map<string, FeatureIndexEntry>();
  for (const app of apps) {
    for (const feature of app.features) {
      const permIdByCode = new Map<string, string>();
      const permCodeById = new Map<string, string>();
      for (const p of feature.permissions) {
        permIdByCode.set(p.code, p.featurePermissionId);
        permCodeById.set(p.featurePermissionId, p.code);
      }
      const entry: FeatureIndexEntry = { id: feature.id, code: feature.code, permIdByCode, permCodeById };
      byCode.set(feature.code, entry);
      byId.set(feature.id, entry);
    }
  }
  return { byCode, byId };
}
