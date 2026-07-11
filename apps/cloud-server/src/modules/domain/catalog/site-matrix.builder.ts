// Re-exports the shared site matrix builder from api-sdk — the single implementation used by cloud and core

import {
  buildSiteMatrix,
  type FeatureLocks,
  type ScopeType,
  type SiteMatrix,
  type SiteType,
  type SnapshotFeature,
  type VersionSnapshot,
} from '@vritti/api-sdk/catalog-resolver';

export type {
  SiteMatrix,
  SiteMatrixApp,
  SiteMatrixCell,
  SiteMatrixFeature,
  SiteMatrixPermission,
} from '@vritti/api-sdk/catalog-resolver';
export { buildSiteMatrix } from '@vritti/api-sdk/catalog-resolver';

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
  const features: Record<string, SnapshotFeature> = {};
  for (const [code, feature] of Object.entries(snapshot.features ?? {})) {
    if (feature.scope === scope) features[code] = { ...feature, scope: 'SITE' };
  }
  return buildSiteMatrix({ ...snapshot, features }, businessCode, planCode, locks);
}
