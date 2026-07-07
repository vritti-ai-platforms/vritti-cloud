import { axios } from '@vritti/quantum-ui/axios';
import type { SuccessResponse } from '@vritti/quantum-ui/types/api-response';

// Plan matrix terminology = "unlocks" (a plan UNLOCKS feature-permissions). Types are plan-owned (not shared).
export type Platform = 'WEB' | 'MOBILE';
export const PLATFORM_ORDER: Platform[] = ['WEB', 'MOBILE'];
export const PLATFORM_LABEL: Record<Platform, string> = { WEB: 'Web', MOBILE: 'Mobile' };

export interface PlanPermissionOption {
  featurePermissionId: string;
  code: string;
  label: string;
  // Sibling permission codes that must be granted on the same platform before this one
  dependsOn: string[];
}

export interface PlanMatrixFeature {
  id: string;
  code: string;
  name: string;
  lucideIcon: string | null;
  permissions: PlanPermissionOption[];
  platforms: Platform[];
}

// One per-platform unlock = the plan unlocks this feature on a platform, with the unlocked permission ids
export interface PlanUnlock {
  featureId: string;
  platform: Platform;
  permissions: string[];
}

// One app (catalog) + the plan's current unlocks nested under it
export interface PlanMatrixApp {
  id: string;
  code: string;
  name: string;
  icon: string | null;
  features: PlanMatrixFeature[];
  unlocks: PlanUnlock[];
}

function base(versionId: string, businessId: string, planId: string): string {
  return `admin-api/versions/${versionId}/businesses/${businessId}/plans/${planId}/permissions`;
}

// Fetches the matrix — apps (catalog) each with the plan's current unlocks nested
export function getPlanMatrix(
  versionId: string,
  businessId: string,
  planId: string,
): Promise<{ apps: PlanMatrixApp[] }> {
  return axios.get<{ apps: PlanMatrixApp[] }>(base(versionId, businessId, planId)).then((r) => r.data);
}

// Replaces the plan's unlocks (each with its unlocked permissions)
export function setPlanUnlocked({
  versionId,
  businessId,
  planId,
  unlocks,
}: {
  versionId: string;
  businessId: string;
  planId: string;
  unlocks: PlanUnlock[];
}): Promise<SuccessResponse> {
  return axios.put<SuccessResponse>(base(versionId, businessId, planId), { unlocks }).then((r) => r.data);
}
