// Snapshot-driven Apps & Features matrix — shared by the BU lock editor and the Create Custom Role picker.
// Code-based + per-platform; shows ALL apps/features/permissions, with locked items carrying their upsell plans.

import type { RevokedGrants } from '@/schemas/cloud/role-grants';

export type MatrixPlatform = 'web' | 'mobile';
export const MATRIX_PLATFORMS: MatrixPlatform[] = ['web', 'mobile'];
export const PLATFORM_LABEL: Record<MatrixPlatform, string> = { web: 'Web', mobile: 'Mobile' };

// One (permission, platform) cell. null ⇒ the feature doesn't ship on that platform.
export interface BuMatrixCell {
  inPlan: boolean; // the plan unlocks this (feature, platform, permission)
  selected: boolean; // the BU currently has it enabled (never true when !inPlan)
  availableIn: string[]; // other plan names that unlock it — upsell; only when !inPlan
}

export interface BuMatrixPermission {
  code: string;
  label: string;
  web: BuMatrixCell | null;
  mobile: BuMatrixCell | null;
}

export interface BuMatrixFeature {
  code: string;
  name: string;
  icon: string | null;
  platforms: MatrixPlatform[];
  inPlan: boolean; // feature-level: is this feature a member of the plan at all?
  availableIn: string[]; // plans that include the feature — upsell when !inPlan
  permissions: BuMatrixPermission[];
}

export interface BuMatrixApp {
  code: string;
  name: string;
  icon: string | null;
  unlockedCount: number;
  totalCount: number;
  features: BuMatrixFeature[];
}

export interface BuMatrix {
  plan: { code: string; name: string };
  apps: BuMatrixApp[];
  // The stored deny-list — the editor seeds its selection from this, not from the selected flags
  locks: BuFeatureLocks;
}

// Code-keyed grant allow-list — the matrix selection value and the role grant share this exact shape
export type FeatureUnlocks = Record<string, { web?: string[]; mobile?: string[] }>;

// BU deny-list overlay — platform null locks the whole feature on that platform, string[] locks those codes,
// feature/platform absent = fully available within the plan
export type BuFeatureLocks = RevokedGrants;

// PUT body for the BU lock editor: locks = plan ceiling − effective selection
export type SetBuLocksBody = { locks: BuFeatureLocks };

// The plan ceiling as a selection — per feature/platform, the codes the plan unlocks; a platform key is present
// only when the feature is a plan member there (some in-plan codes), mirroring the matrix's lockedOnPlatform rule
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
