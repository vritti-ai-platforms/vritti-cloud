import type {
  BuFeatureLocks,
  BuMatrixApp,
  FeatureUnlocks,
  PlatformBucket,
} from '@vritti/quantum-ui/types/catalog-resolver';
import { MATRIX_PLATFORMS } from '@/schemas/cloud/bu-matrix';

// The matrix value is the EFFECTIVE selection: a code-keyed, per-platform allow-list. A platform key present (even an
// empty array) means the feature switch is on for that platform; the array holds the enabled permission codes.
// These are pure helpers so the value can live directly in a react-hook-form field (Controller).

// Deep-clones the value so updates stay immutable for react-hook-form's change detection
function clone(selection: FeatureUnlocks): FeatureUnlocks {
  const next: FeatureUnlocks = {};
  for (const [code, entry] of Object.entries(selection)) {
    next[code] = {
      ...(entry.web !== undefined ? { web: [...entry.web] } : {}),
      ...(entry.mobile !== undefined ? { mobile: [...entry.mobile] } : {}),
    };
  }
  return next;
}

// ——— Lock-mode helpers (BU editor) ———
// In lock mode the value IS the deny-list (BuFeatureLocks): platform null = whole feature locked there,
// string[] = those codes locked, absent = fully available. Switch ON = lock the feature; checked box = lock the code.

// Deep-clones the deny-list so updates stay immutable for react-hook-form's change detection
function cloneLocks(locks: BuFeatureLocks): BuFeatureLocks {
  const next: BuFeatureLocks = {};
  for (const [code, entry] of Object.entries(locks)) {
    next[code] = {
      ...(entry.web !== undefined ? { web: entry.web === null ? null : [...entry.web] } : {}),
      ...(entry.mobile !== undefined ? { mobile: entry.mobile === null ? null : [...entry.mobile] } : {}),
    };
  }
  return next;
}

// The whole feature is locked on this platform (the lock switch is on)
export function isPlatformLockedIn(locks: BuFeatureLocks, code: string, platform: PlatformBucket): boolean {
  return locks[code]?.[platform] === null;
}

// This permission is locked on this platform — directly, or via a whole-platform lock
export function isCodeLockedIn(
  locks: BuFeatureLocks,
  code: string,
  platform: PlatformBucket,
  permCode: string,
): boolean {
  const entry = locks[code]?.[platform];
  return entry === null || (entry?.includes(permCode) ?? false);
}

// The feature lock switch — on locks the whole platform (null), off clears the platform's locks entirely
export function togglePlatformLock(locks: BuFeatureLocks, code: string, platform: PlatformBucket): BuFeatureLocks {
  const next = cloneLocks(locks);
  const entry = next[code] ?? {};
  if (entry[platform] === null) delete entry[platform];
  else entry[platform] = null;
  if (entry.web === undefined && entry.mobile === undefined) delete next[code];
  else next[code] = entry;
  return next;
}

// Toggle one permission's lock (only reachable while the platform isn't fully locked)
export function toggleCodeLock(
  locks: BuFeatureLocks,
  code: string,
  platform: PlatformBucket,
  permCode: string,
): BuFeatureLocks {
  const next = cloneLocks(locks);
  const entry = next[code] ?? {};
  const raw = entry[platform];
  const current = Array.isArray(raw) ? raw : [];
  const updated = current.includes(permCode) ? current.filter((c) => c !== permCode) : [...current, permCode];
  if (updated.length === 0) delete entry[platform];
  else entry[platform] = updated;
  if (entry.web === undefined && entry.mobile === undefined) delete next[code];
  else next[code] = entry;
  return next;
}

// Locked feature-switch + locked in-plan permission tallies for the footer (out-of-plan lock codes are inert)
export function countLocks(apps: BuMatrixApp[], locks: BuFeatureLocks): { features: number; permissions: number } {
  let features = 0;
  let permissions = 0;
  for (const app of apps) {
    for (const feature of app.features) {
      for (const platform of MATRIX_PLATFORMS) {
        const entry = locks[feature.code]?.[platform];
        if (entry === undefined) continue;
        const inPlan = feature.permissions.filter((p) => p[platform]?.inPlan).map((p) => p.code);
        if (entry === null) {
          if (inPlan.length > 0) {
            features += 1;
            permissions += inPlan.length;
          }
        } else {
          permissions += entry.filter((c) => inPlan.includes(c)).length;
        }
      }
    }
  }
  return { features, permissions };
}

// A feature is a "member" on a platform (its switch is on) when the platform key is present (even if empty)
export function isMemberIn(selection: FeatureUnlocks, code: string, platform: PlatformBucket): boolean {
  return selection[code]?.[platform] !== undefined;
}

export function isCheckedIn(
  selection: FeatureUnlocks,
  code: string,
  platform: PlatformBucket,
  permCode: string,
): boolean {
  return selection[code]?.[platform]?.includes(permCode) ?? false;
}

// The feature switch — on enables every in-plan permission on that platform, off removes the platform entirely
export function toggleMemberIn(
  selection: FeatureUnlocks,
  code: string,
  platform: PlatformBucket,
  inPlanCodes: string[],
): FeatureUnlocks {
  const next = clone(selection);
  const entry = next[code] ?? {};
  if (entry[platform] !== undefined) delete entry[platform];
  else entry[platform] = [...inPlanCodes];
  if (entry.web === undefined && entry.mobile === undefined) delete next[code];
  else next[code] = entry;
  return next;
}

// Toggle one permission within a member platform (the switch stays on even when the last permission is removed)
export function togglePermIn(
  selection: FeatureUnlocks,
  code: string,
  platform: PlatformBucket,
  permCode: string,
): FeatureUnlocks {
  const next = clone(selection);
  const entry = next[code] ?? {};
  const arr = entry[platform] ?? [];
  entry[platform] = arr.includes(permCode) ? arr.filter((c) => c !== permCode) : [...arr, permCode];
  next[code] = entry;
  return next;
}

// Feature + permission tallies for the summary footer
export function countSelection(selection: FeatureUnlocks): { features: number; permissions: number } {
  let features = 0;
  let permissions = 0;
  for (const entry of Object.values(selection)) {
    if (entry.web !== undefined || entry.mobile !== undefined) features += 1;
    permissions += (entry.web?.length ?? 0) + (entry.mobile?.length ?? 0);
  }
  return { features, permissions };
}
