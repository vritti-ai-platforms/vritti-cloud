import { axios } from '@vritti/quantum-ui/axios';
import type { SuccessResponse } from '@vritti/quantum-ui/api-response';
import type { AssignPlanAppData, PlanApp, PlanAppsTableResponse, UpdatePlanAppData } from '@/schemas/admin/plan-apps';

// Fetches plan apps for the data table — server applies filter/sort state
export function getPlanAppsTable(planId: string): Promise<PlanAppsTableResponse> {
  return axios.get<PlanAppsTableResponse>(`admin-api/plans/${planId}/apps/table`).then((r) => r.data);
}

// Fetches apps assigned to a plan
export function getPlanApps(planId: string): Promise<PlanApp[]> {
  return axios.get<PlanApp[]>(`admin-api/plans/${planId}/apps`).then((r) => r.data);
}

// Assigns an app to a plan
export function assignPlanApp({
  planId,
  data,
}: {
  planId: string;
  data: AssignPlanAppData;
}): Promise<PlanApp> {
  return axios.post<PlanApp>(`admin-api/plans/${planId}/apps`, data).then((r) => r.data);
}

// Updates an app assignment on a plan
export function updatePlanApp({
  planId,
  appId,
  data,
}: {
  planId: string;
  appId: string;
  data: UpdatePlanAppData;
}): Promise<SuccessResponse> {
  return axios.patch<SuccessResponse>(`admin-api/plans/${planId}/apps/${appId}`, data).then((r) => r.data);
}

// Removes an app from a plan
export function removePlanApp({ planId, appId }: { planId: string; appId: string }): Promise<void> {
  return axios.delete(`admin-api/plans/${planId}/apps/${appId}`).then(() => undefined);
}
