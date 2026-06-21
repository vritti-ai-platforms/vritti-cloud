import type { SuccessResponse } from '@vritti/quantum-ui/api-response';
import { axios } from '@vritti/quantum-ui/axios';
import type { MatrixApp, MatrixGrant } from '@/schemas/admin/permission-matrix';

// The unlock matrix shares the role-template matrix shapes (app → feature → permission, per platform)
export type AvailablePlanApp = MatrixApp;
export type PlanUnlockGrant = MatrixGrant;

function base(versionId: string, businessId: string, planId: string): string {
  return `admin-api/versions/${versionId}/businesses/${businessId}/plans/${planId}/permissions`;
}

// Fetches the unlock-matrix source (the business's apps, each with its features + permissions + platforms)
export function getPlanAvailableApps(
  versionId: string,
  businessId: string,
  planId: string,
): Promise<AvailablePlanApp[]> {
  return axios.get<AvailablePlanApp[]>(`${base(versionId, businessId, planId)}/apps`).then((r) => r.data);
}

// Fetches the plan's currently unlocked (feature-permission, platform) grants
export function getPlanUnlocked(
  versionId: string,
  businessId: string,
  planId: string,
): Promise<{ grants: PlanUnlockGrant[] }> {
  return axios.get<{ grants: PlanUnlockGrant[] }>(base(versionId, businessId, planId)).then((r) => r.data);
}

// Replaces the plan's unlocked set
export function setPlanUnlocked({
  versionId,
  businessId,
  planId,
  grants,
}: {
  versionId: string;
  businessId: string;
  planId: string;
  grants: PlanUnlockGrant[];
}): Promise<SuccessResponse> {
  return axios.put<SuccessResponse>(base(versionId, businessId, planId), { grants }).then((r) => r.data);
}
