import type { SuccessResponse } from '@vritti/quantum-ui/api-response';
import { axios } from '@vritti/quantum-ui/axios';

export interface AvailablePlanPermission {
  featurePermissionId: string;
  code: string;
  label: string;
}

export interface AvailablePlanFeature {
  id: string;
  code: string;
  name: string;
  icon: string;
  appCode: string;
  permissions: AvailablePlanPermission[];
}

function base(versionId: string, businessId: string, planId: string): string {
  return `admin-api/versions/${versionId}/businesses/${businessId}/plans/${planId}/permissions`;
}

// Fetches the unlock-matrix source (features + permissions from the plan's apps)
export function getPlanAvailableFeatures(
  versionId: string,
  businessId: string,
  planId: string,
): Promise<AvailablePlanFeature[]> {
  return axios.get<AvailablePlanFeature[]>(`${base(versionId, businessId, planId)}/features`).then((r) => r.data);
}

// Fetches the plan's currently unlocked feature-permission ids
export function getPlanUnlocked(
  versionId: string,
  businessId: string,
  planId: string,
): Promise<{ featurePermissionIds: string[] }> {
  return axios
    .get<{ featurePermissionIds: string[] }>(base(versionId, businessId, planId))
    .then((r) => r.data);
}

// Replaces the plan's unlocked set
export function setPlanUnlocked({
  versionId,
  businessId,
  planId,
  featurePermissionIds,
}: {
  versionId: string;
  businessId: string;
  planId: string;
  featurePermissionIds: string[];
}): Promise<SuccessResponse> {
  return axios.put<SuccessResponse>(base(versionId, businessId, planId), { featurePermissionIds }).then((r) => r.data);
}
