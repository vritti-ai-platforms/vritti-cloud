// Re-exports the shared site matrix builder from api-sdk — the single implementation used by cloud and core

import {
  buildSiteMatrix,
  type FeatureLocks,
  type ScopeType,
  type SiteMatrix,
  type SiteType,
  type SnapshotBusiness,
  type SnapshotFeature,
  snapshotFeatureKey,
  type VersionSnapshot,
} from '@vritti/api-sdk/catalog-resolver';

export type {
  SiteMatrix,
  SiteMatrixApp,
  SiteMatrixCell,
  SiteMatrixFeature,
  SiteMatrixPermission,
} from '@vritti/api-sdk/catalog-resolver';
export { buildPlanMatrix, buildSiteMatrix } from '@vritti/api-sdk/catalog-resolver';

// Builds the lock matrix for one scope: keeps only that scope's features and remaps them to SITE so the shared builder (which emits SITE-scope features only) accepts them
export function buildScopedMatrix(
  snapshot: VersionSnapshot,
  businessCode: string | undefined,
  planCode: string | undefined,
  locks: FeatureLocks | undefined,
  scope: ScopeType,
  siteType?: SiteType,
): SiteMatrix {
  if (scope === 'SITE') return buildSiteMatrix(snapshot, businessCode, planCode, locks, siteType);

  // Remap the requested scope's features onto the SITE bucket (composite key re-keyed to SITE)
  const features: Record<string, SnapshotFeature> = {};
  for (const feature of Object.values(snapshot.features ?? {})) {
    if (feature.scope !== scope) continue;
    features[snapshotFeatureKey(feature.code, 'SITE')] = { ...feature, scope: 'SITE' };
  }

  // Remap each app's feature refs of the requested scope onto SITE so the shared builder picks them up
  const businesses: Record<string, SnapshotBusiness> = {};
  for (const [code, business] of Object.entries(snapshot.businesses ?? {})) {
    businesses[code] = {
      ...business,
      apps: business.apps.map((app) => ({
        ...app,
        features: app.features
          .filter((ref) => ref.scope === scope)
          .map((ref) => ({ code: ref.code, scope: 'SITE' as const })),
      })),
    };
  }

  return buildSiteMatrix({ ...snapshot, features, businesses }, businessCode, planCode, locks);
}
