import type { SuccessResponse } from '@vritti/quantum-ui/api-response';
import { axios } from '@vritti/quantum-ui/axios';
import type { AppVersion, AppVersionsTableResponse, CreateAppVersionData, UpdateAppVersionData } from '@/schemas/admin/app-versions';

// Fetches app versions for the data table — server applies filter/sort state
export function getAppVersionsTable(): Promise<AppVersionsTableResponse> {
  return axios.get<AppVersionsTableResponse>('admin-api/app-versions/table').then((r) => r.data);
}

// Fetches a single app version by ID
export function getAppVersion(id: string): Promise<AppVersion> {
  return axios.get<AppVersion>(`admin-api/app-versions/${id}`).then((r) => r.data);
}

// Creates a new app version
export function createAppVersion(data: CreateAppVersionData): Promise<AppVersion> {
  return axios.post<AppVersion>('admin-api/app-versions', data).then((r) => r.data);
}

// Updates an app version's name and/or version string
export function updateAppVersion({ id, data }: { id: string; data: UpdateAppVersionData }): Promise<SuccessResponse> {
  return axios.patch<SuccessResponse>(`admin-api/app-versions/${id}`, data).then((r) => r.data);
}

// Builds a snapshot from all versioned tables
export function createSnapshot(id: string): Promise<SuccessResponse> {
  return axios.post<SuccessResponse>(`admin-api/app-versions/${id}/snapshot`).then((r) => r.data);
}

// Pushes build artifacts for an app version
export function pushArtifacts(id: string, data: Record<string, unknown>): Promise<SuccessResponse> {
  return axios.post<SuccessResponse>(`admin-api/app-versions/${id}/artifacts`, data).then((r) => r.data);
}

// Deletes an app version by ID
export function deleteAppVersion(id: string): Promise<void> {
  return axios.delete(`admin-api/app-versions/${id}`).then(() => undefined);
}
