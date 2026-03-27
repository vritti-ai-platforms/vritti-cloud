import type { CreateResponse, SuccessResponse } from '@vritti/quantum-ui/api-response';
import { axios } from '@vritti/quantum-ui/axios';
import type { ValidateImportResponse } from '@/schemas/admin/import';
import type {
  AddAppPriceData,
  App,
  AppFeature,
  AppFeaturesTableResponse,
  AppPrice,
  AppsTableResponse,
  CreateAppData,
  UpdateAppData,
  UpdateAppPriceData,
} from '@/schemas/admin/apps';

// Fetches apps for the data table — server applies filter/sort state
export function getApps(versionId: string): Promise<AppsTableResponse> {
  return axios.get<AppsTableResponse>(`admin-api/versions/${versionId}/apps/table`).then((r) => r.data);
}

// Fetches a single app with counts
export function getApp(versionId: string, id: string): Promise<App> {
  return axios.get<App>(`admin-api/versions/${versionId}/apps/${id}`).then((r) => r.data);
}

// Creates a new app
export function createApp(versionId: string, data: CreateAppData): Promise<CreateResponse<App>> {
  return axios.post<CreateResponse<App>>(`admin-api/versions/${versionId}/apps`, data).then((r) => r.data);
}

// Updates an app by ID
export function updateApp(versionId: string, { id, data }: { id: string; data: UpdateAppData }): Promise<SuccessResponse> {
  return axios.patch<SuccessResponse>(`admin-api/versions/${versionId}/apps/${id}`, data).then((r) => r.data);
}

// Deletes an app by ID
export function deleteApp(versionId: string, id: string): Promise<void> {
  return axios.delete(`admin-api/versions/${versionId}/apps/${id}`).then(() => undefined);
}

// Fetches app features for the data table — server applies filter/sort state
export function getAppFeaturesTable(versionId: string, appId: string): Promise<AppFeaturesTableResponse> {
  return axios.get<AppFeaturesTableResponse>(`admin-api/versions/${versionId}/apps/${appId}/features/table`).then((r) => r.data);
}

// Fetches features assigned to an app
export function getAppFeatures(versionId: string, appId: string): Promise<AppFeature[]> {
  return axios.get<AppFeature[]>(`admin-api/versions/${versionId}/apps/${appId}/features`).then((r) => r.data);
}

// Assigns features to an app
export function assignAppFeatures({
  versionId,
  appId,
  data,
}: {
  versionId: string;
  appId: string;
  data: { featureIds: string[] };
}): Promise<SuccessResponse> {
  return axios.post<SuccessResponse>(`admin-api/versions/${versionId}/apps/${appId}/features`, data).then((r) => r.data);
}

// Removes a feature from an app
export function removeAppFeature({ versionId, appId, featureId }: { versionId: string; appId: string; featureId: string }): Promise<void> {
  return axios.delete(`admin-api/versions/${versionId}/apps/${appId}/features/${featureId}`).then(() => undefined);
}

// Fetches prices for an app
export function getAppPrices(versionId: string, appId: string): Promise<AppPrice[]> {
  return axios.get<AppPrice[]>(`admin-api/versions/${versionId}/apps/${appId}/prices`).then((r) => r.data);
}

// Creates a new price for an app
export function createAppPrice({ versionId, appId, data }: { versionId: string; appId: string; data: AddAppPriceData }): Promise<CreateResponse<AppPrice>> {
  return axios.post<CreateResponse<AppPrice>>(`admin-api/versions/${versionId}/apps/${appId}/prices`, data).then((r) => r.data);
}

// Updates an app price by ID
export function updateAppPrice({
  versionId,
  appId,
  priceId,
  data,
}: {
  versionId: string;
  appId: string;
  priceId: string;
  data: UpdateAppPriceData;
}): Promise<SuccessResponse> {
  return axios.patch<SuccessResponse>(`admin-api/versions/${versionId}/apps/${appId}/prices/${priceId}`, data).then((r) => r.data);
}

// Removes an app price by ID
export function removeAppPrice({ versionId, appId, priceId }: { versionId: string; appId: string; priceId: string }): Promise<void> {
  return axios.delete(`admin-api/versions/${versionId}/apps/${appId}/prices/${priceId}`).then(() => undefined);
}

// Uploads a file for validation and returns parsed rows with errors
export function validateAppImport(versionId: string, file: File): Promise<ValidateImportResponse> {
  const formData = new FormData();
  formData.append('file', file);
  return axios
    .post<ValidateImportResponse>(`admin-api/versions/${versionId}/apps/validate`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      showSuccessToast: false,
    })
    .then((r) => r.data);
}

// Bulk creates apps from validated data
export function bulkCreateApps(versionId: string, apps: Record<string, string>[]): Promise<SuccessResponse> {
  return axios
    .post<SuccessResponse>(`admin-api/versions/${versionId}/apps/bulk`, {
      apps: apps.map((a, i) => ({ ...a, versionId, sortOrder: i })),
    })
    .then((r) => r.data);
}
