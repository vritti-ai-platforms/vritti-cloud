import type { BuMatrixApp, FeatureUnlocks, MatrixPlatform } from '@/schemas/cloud/bu-matrix';

// The matrix selection IS the API value: a code-keyed, per-platform allow-list. A platform key present (even an
// empty array) means the feature switch is on for that platform; the array holds the granted permission codes.
// These are pure helpers so the value can live directly in a react-hook-form field (Controller).

// Deep-clones the value so updates stay immutable for react-hook-form's change detection
function clone(unlocks: FeatureUnlocks): FeatureUnlocks {
  const next: FeatureUnlocks = {};
  for (const [code, entry] of Object.entries(unlocks)) {
    next[code] = {
      ...(entry.web !== undefined ? { web: [...entry.web] } : {}),
      ...(entry.mobile !== undefined ? { mobile: [...entry.mobile] } : {}),
    };
  }
  return next;
}

// Builds the initial value from the matrix itself (each in-plan cell's `selected` flag) — used by the BU editor
export function unlocksFromMatrix(apps: BuMatrixApp[]): FeatureUnlocks {
  const out: FeatureUnlocks = {};
  for (const app of apps) {
    for (const feature of app.features) {
      const web: string[] = [];
      const mobile: string[] = [];
      for (const perm of feature.permissions) {
        if (perm.web?.selected) web.push(perm.code);
        if (perm.mobile?.selected) mobile.push(perm.code);
      }
      const entry: { web?: string[]; mobile?: string[] } = {};
      if (web.length) entry.web = web;
      if (mobile.length) entry.mobile = mobile;
      if (entry.web || entry.mobile) out[feature.code] = entry;
    }
  }
  return out;
}

// A feature is a "member" on a platform (its switch is on) when the platform key is present (even if empty)
export function isMemberIn(unlocks: FeatureUnlocks, code: string, platform: MatrixPlatform): boolean {
  return unlocks[code]?.[platform] !== undefined;
}

export function isCheckedIn(
  unlocks: FeatureUnlocks,
  code: string,
  platform: MatrixPlatform,
  permCode: string,
): boolean {
  return unlocks[code]?.[platform]?.includes(permCode) ?? false;
}

// The feature switch — on grants every in-plan permission on that platform, off removes the platform entirely
export function toggleMemberIn(
  unlocks: FeatureUnlocks,
  code: string,
  platform: MatrixPlatform,
  inPlanCodes: string[],
): FeatureUnlocks {
  const next = clone(unlocks);
  const entry = next[code] ?? {};
  if (entry[platform] !== undefined) delete entry[platform];
  else entry[platform] = [...inPlanCodes];
  if (entry.web === undefined && entry.mobile === undefined) delete next[code];
  else next[code] = entry;
  return next;
}

// Toggle one permission within a member platform (the switch stays on even when the last permission is removed)
export function togglePermIn(
  unlocks: FeatureUnlocks,
  code: string,
  platform: MatrixPlatform,
  permCode: string,
): FeatureUnlocks {
  const next = clone(unlocks);
  const entry = next[code] ?? {};
  const arr = entry[platform] ?? [];
  entry[platform] = arr.includes(permCode) ? arr.filter((c) => c !== permCode) : [...arr, permCode];
  next[code] = entry;
  return next;
}

// Feature + permission tallies for the summary footer
export function countUnlocks(unlocks: FeatureUnlocks): { features: number; permissions: number } {
  let features = 0;
  let permissions = 0;
  for (const entry of Object.values(unlocks)) {
    if (entry.web !== undefined || entry.mobile !== undefined) features += 1;
    permissions += (entry.web?.length ?? 0) + (entry.mobile?.length ?? 0);
  }
  return { features, permissions };
}
