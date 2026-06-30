// Snapshot-driven Apps & Features matrix — shared by the BU lock editor and the Create Custom Role picker.
// Code-based + per-platform; shows ALL apps/features/permissions, with locked items carrying their upsell plans.

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
}

// Code-keyed unlock/grant allow-list — the BU save body and the role grant share this exact shape
export type FeatureUnlocks = Record<string, { web?: string[]; mobile?: string[] }>;

// PUT body for the BU lock editor
export type SetBuUnlocksBody = { unlocks: FeatureUnlocks };
