import type { SnapshotFeature, VersionSnapshot } from '@domain/version/root/services/version-snapshot.builder';

// A catalog permission carries its lock state (locked = not unlocked by the org's plan → upsell)
export interface CatalogPermission {
  code: string;
  locked: boolean;
}

// Mirrors core-server's business_units.featureCatalog entry shape exactly
export interface FeatureCatalogEntry {
  code: string;
  name: string;
  icon: string | null;
  sfSymbol: string;
  materialSymbol: string;
  remoteEntry: string | null;
  exposedModule: string | null;
  routePrefix: string | null;
  mobile: {
    remoteEntryAndroid: string;
    remoteEntryIos: string;
    exposedModule: string;
    routePrefix: string;
  } | null;
  appCode: string;
  appName: string;
  appIcon: string | null;
  appSortOrder: number;
  // Feature-level lock = every permission locked (whole feature greyed)
  locked: boolean;
  permissions: CatalogPermission[];
}

// Role template pushed to core for provisioning (matches core RoleItemDto)
export interface RoleItem {
  name: string;
  scope: string;
  sourceRoleId: string;
  isLocked: boolean;
  appCodes: string[];
  features: Record<string, string[]>;
}

// Builds the FULL business catalog with per-permission lock flags from the org's plan (nothing is hidden).
export function buildBuCatalog(
  snapshot: VersionSnapshot,
  businessCode: string | undefined,
  planCode: string | undefined,
): FeatureCatalogEntry[] {
  if (!businessCode) return [];
  const business = snapshot.businesses?.[businessCode];
  if (!business) return [];
  const plan = planCode ? business.plans?.[planCode] : undefined;

  const catalog: FeatureCatalogEntry[] = [];
  const seen = new Set<string>();
  for (const app of business.apps) {
    for (const featureCode of app.features) {
      if (seen.has(featureCode)) continue;
      const feature = snapshot.features?.[featureCode];
      if (!feature) continue;
      const web = feature.microfrontends?.WEB;
      const mobile = feature.microfrontends?.MOBILE;
      // Keep only features with at least one platform route
      if (!web && !mobile) continue;
      seen.add(featureCode);

      const unlocked = plan?.unlockedPermissions?.[feature.code] ?? [];
      const permissions = buildPermissions(feature, businessCode, unlocked);
      const locked = permissions.length === 0 ? true : permissions.every((p) => p.locked);

      catalog.push({
        code: feature.code,
        name: feature.name,
        icon: feature.icon ?? null,
        sfSymbol: feature.sfSymbol ?? 'square',
        materialSymbol: feature.materialSymbol ?? 'square',
        remoteEntry: web?.remoteEntry ?? null,
        exposedModule: web?.exposedModule ?? null,
        routePrefix: web?.routePrefix ?? null,
        mobile: mobile
          ? {
              remoteEntryAndroid: mobile.remoteEntryAndroid ?? '',
              remoteEntryIos: mobile.remoteEntryIos ?? '',
              exposedModule: mobile.exposedModule ?? '',
              routePrefix: mobile.routePrefix ?? '',
            }
          : null,
        appCode: app.code,
        appName: app.name,
        appIcon: app.icon ?? null,
        appSortOrder: app.sortOrder ?? 0,
        locked,
        permissions,
      });
    }
  }
  return catalog;
}

// A feature's business-scoped permissions, each tagged locked against the plan's unlocked set
function buildPermissions(feature: SnapshotFeature, businessCode: string, unlocked: string[]): CatalogPermission[] {
  return (feature.permissions ?? [])
    .filter((p) => p.isGlobal || p.businesses.includes(businessCode))
    .map((p) => ({ code: p.code, locked: !unlocked.includes(p.code) }));
}

// Maps the business's role templates into provisionable role items for core (global grants)
export function buildBuRoles(snapshot: VersionSnapshot, businessCode: string | undefined): RoleItem[] {
  if (!businessCode) return [];
  const business = snapshot.businesses?.[businessCode];
  if (!business) return [];
  return business.roleTemplates.map((r) => ({
    name: r.name,
    scope: r.scope,
    sourceRoleId: r.sourceRoleId,
    isLocked: false,
    appCodes: r.apps,
    features: r.features,
  }));
}
