import type { CreateResponse, SuccessResponse } from '@vritti/quantum-ui/api-response';
import { axios } from '@vritti/quantum-ui/axios';
import type { App, AppFeaturesTableResponse, AppsTableResponse, CreateAppData, UpdateAppData } from '@/schemas/admin/apps';

// Fetches apps for the data table scoped to a business — server applies filter/sort state
export function getApps(versionId: string, businessId: string): Promise<AppsTableResponse> {
  return axios
    .get<AppsTableResponse>(`admin-api/versions/${versionId}/businesses/${businessId}/apps/table`)
    .then((r) => r.data);
}

// Fetches a single app with counts
export function getApp(versionId: string, businessId: string, id: string): Promise<App> {
  return axios.get<App>(`admin-api/versions/${versionId}/businesses/${businessId}/apps/${id}`).then((r) => r.data);
}

// Creates a new app
export function createApp(versionId: string, businessId: string, data: CreateAppData): Promise<CreateResponse<App>> {
  return axios
    .post<CreateResponse<App>>(`admin-api/versions/${versionId}/businesses/${businessId}/apps`, data)
    .then((r) => r.data);
}

// Updates an app by ID
export function updateApp(
  versionId: string,
  businessId: string,
  { id, data }: { id: string; data: UpdateAppData },
): Promise<SuccessResponse> {
  return axios
    .patch<SuccessResponse>(`admin-api/versions/${versionId}/businesses/${businessId}/apps/${id}`, data)
    .then((r) => r.data);
}

// Deletes an app by ID
export function deleteApp(versionId: string, businessId: string, id: string): Promise<void> {
  return axios
    .delete(`admin-api/versions/${versionId}/businesses/${businessId}/apps/${id}`)
    .then(() => undefined);
}

// Fetches app features for the data table — server applies filter/sort state
export function getAppFeaturesTable(
  versionId: string,
  businessId: string,
  appId: string,
): Promise<AppFeaturesTableResponse> {
  return axios
    .get<AppFeaturesTableResponse>(
      `admin-api/versions/${versionId}/businesses/${businessId}/apps/${appId}/features/table`,
    )
    .then((r) => r.data);
}

// Toggles a feature assignment for an app (assign if absent, remove if present)
export function toggleAppFeature({
  versionId,
  businessId,
  appId,
  featureId,
}: {
  versionId: string;
  businessId: string;
  appId: string;
  featureId: string;
}): Promise<SuccessResponse> {
  return axios
    .put<SuccessResponse>(
      `admin-api/versions/${versionId}/businesses/${businessId}/apps/${appId}/features/${featureId}`,
    )
    .then((r) => r.data);
}
