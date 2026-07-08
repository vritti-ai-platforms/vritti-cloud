// Snapshot-driven Apps & Features matrix shared by the BU lock editor and the Create Custom Role picker.

import type {
  BuFeatureLocks,
  BuMatrixApp,
  FeatureUnlocks,
  PlatformBucket,
} from '@vritti/quantum-ui/types/catalog-resolver';
import { PLATFORMS as MATRIX_PLATFORMS } from '@vritti/quantum-ui/types/catalog-resolver';

export { PLATFORMS as MATRIX_PLATFORMS } from '@vritti/quantum-ui/types/catalog-resolver';
export const PLATFORM_LABEL: Record<PlatformBucket, string> = { web: 'Web', mobile: 'Mobile' };

export type SetBuLocksBody = { locks: BuFeatureLocks };

// Builds the plan ceiling as a selection: per feature/platform, the codes the plan unlocks.
export function planCeilingFromMatrix(apps: BuMatrixApp[]): FeatureUnlocks {
  const out: FeatureUnlocks = {};
  for (const app of apps) {
    for (const feature of app.features) {
      const entry: { web?: string[]; mobile?: string[] } = {};
      for (const platform of MATRIX_PLATFORMS) {
        const codes = feature.permissions.filter((p) => p[platform]?.inPlan).map((p) => p.code);
        if (codes.length > 0) entry[platform] = codes;
      }
      if (entry.web || entry.mobile) out[feature.code] = entry;
    }
  }
  return out;
}
