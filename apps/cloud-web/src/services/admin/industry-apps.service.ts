import { axios } from '@vritti/quantum-ui/axios';
import type { SuccessResponse } from '@vritti/quantum-ui/api-response';
import type { AssignIndustryAppData, IndustryApp, UpdateIndustryAppData } from '@/schemas/admin/industry-apps';

// Fetches apps assigned to an industry
export function getIndustryApps(industryId: string): Promise<IndustryApp[]> {
  return axios.get<IndustryApp[]>(`admin-api/industries/${industryId}/apps`).then((r) => r.data);
}

// Assigns an app to an industry
export function assignIndustryApp({
  industryId,
  data,
}: {
  industryId: string;
  data: AssignIndustryAppData;
}): Promise<IndustryApp> {
  return axios.post<IndustryApp>(`admin-api/industries/${industryId}/apps`, data).then((r) => r.data);
}

// Updates an app assignment on an industry
export function updateIndustryApp({
  industryId,
  appId,
  data,
}: {
  industryId: string;
  appId: string;
  data: UpdateIndustryAppData;
}): Promise<SuccessResponse> {
  return axios.patch<SuccessResponse>(`admin-api/industries/${industryId}/apps/${appId}`, data).then((r) => r.data);
}

// Removes an app from an industry
export function removeIndustryApp({ industryId, appId }: { industryId: string; appId: string }): Promise<void> {
  return axios.delete(`admin-api/industries/${industryId}/apps/${appId}`).then(() => undefined);
}
