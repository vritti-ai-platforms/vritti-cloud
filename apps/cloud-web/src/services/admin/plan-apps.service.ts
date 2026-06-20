import type { SuccessResponse } from '@vritti/quantum-ui/api-response';
import { axios } from '@vritti/quantum-ui/axios';
import type { AssignPlanAppData, PlanApp, PlanAppsTableResponse, UpdatePlanAppData } from '@/schemas/admin/plan-apps';

function base(versionId: string, businessId: string, planId: string): string {
  return `admin-api/versions/${versionId}/businesses/${businessId}/plans/${planId}/apps`;
}

// Fetches plan apps for the data table — server applies filter/sort state
export function getPlanAppsTable(
  versionId: string,
  businessId: string,
  planId: string,
): Promise<PlanAppsTableResponse> {
  return axios.get<PlanAppsTableResponse>(`${base(versionId, businessId, planId)}/table`).then((r) => r.data);
}

// Assigns an app to a plan
export function assignPlanApp({
  versionId,
  businessId,
  planId,
  data,
}: {
  versionId: string;
  businessId: string;
  planId: string;
  data: AssignPlanAppData;
}): Promise<PlanApp> {
  return axios.post<PlanApp>(base(versionId, businessId, planId), data).then((r) => r.data);
}

// Updates an app assignment on a plan
export function updatePlanApp({
  versionId,
  businessId,
  planId,
  appId,
  data,
}: {
  versionId: string;
  businessId: string;
  planId: string;
  appId: string;
  data: UpdatePlanAppData;
}): Promise<SuccessResponse> {
  return axios.patch<SuccessResponse>(`${base(versionId, businessId, planId)}/${appId}`, data).then((r) => r.data);
}

// Removes an app from a plan
export function removePlanApp({
  versionId,
  businessId,
  planId,
  appId,
}: {
  versionId: string;
  businessId: string;
  planId: string;
  appId: string;
}): Promise<void> {
  return axios.delete(`${base(versionId, businessId, planId)}/${appId}`).then(() => undefined);
}
