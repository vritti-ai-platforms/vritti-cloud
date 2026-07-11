import { axios } from '@vritti/quantum-ui/axios';
import type { SuccessResponse } from '@vritti/quantum-ui/types/api-response';
import type { ScopeType } from '@/schemas/admin/features';

export type Platform = 'WEB' | 'MOBILE';
export const PLATFORM_ORDER: Platform[] = ['WEB', 'MOBILE'];
export const PLATFORM_LABEL: Record<Platform, string> = { WEB: 'Web', MOBILE: 'Mobile' };

export interface PlanPermissionOption {
  featurePermissionId: string;
  code: string;
  label: string;
  dependsOn: string[];
}

export interface PlanMatrixFeature {
  id: string;
  code: string;
  name: string;
  scope: ScopeType;
  lucideIcon: string | null;
  permissions: PlanPermissionOption[];
  platforms: Platform[];
}

export interface PlanUnlock {
  featureId: string;
  platform: Platform;
  permissions: string[];
}

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
