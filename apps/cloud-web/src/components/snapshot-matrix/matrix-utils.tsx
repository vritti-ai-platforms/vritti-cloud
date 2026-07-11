import type { PlatformBucket, SiteMatrixFeature } from '@vritti/quantum-ui/types/catalog-resolver';

// The in-plan permission codes of a feature on a platform — what a feature-level toggle covers
export function inPlanCodes(feature: SiteMatrixFeature, platform: PlatformBucket): string[] {
  return feature.permissions.filter((p) => p[platform]?.inPlan).map((p) => p.code);
}

// True when the feature ships on this platform but the plan unlocks nothing there
export function lockedOnPlatform(feature: SiteMatrixFeature, platform: PlatformBucket): boolean {
  return feature.platforms.includes(platform) && inPlanCodes(feature, platform).length === 0;
}

// Tooltip body for a plan-lock chip — lists the plans that unlock it (or a fallback when none do)
export function lockTooltip(plans: string[]): React.ReactNode {
  if (plans.length === 0) return 'Not included in your plan';
  return (
    <span>
      Available in <span className="font-semibold">{plans.join(', ')}</span>
    </span>
  );
}

// Plan names that would unlock this feature on a given platform (union across its locked cells) — the upsell
export function platformUpsell(feature: SiteMatrixFeature, platform: PlatformBucket): string[] {
  const names = new Set<string>();
  for (const perm of feature.permissions) {
    const cell = perm[platform];
    if (cell && !cell.inPlan) for (const n of cell.availableIn) names.add(n);
  }
  for (const n of feature.availableIn) names.add(n);
  return [...names];
}
