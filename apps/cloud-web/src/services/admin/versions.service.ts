import type { CreateResponse, SuccessResponse } from '@vritti/quantum-ui/api-response';
import { axios } from '@vritti/quantum-ui/axios';
import type { CreateVersionData, UpdateVersionData, Version, VersionsTableResponse } from '@/schemas/admin/versions';

// Fetches versions for the data table — server applies filter/sort state
export function getVersionsTable(): Promise<VersionsTableResponse> {
  return axios.get<VersionsTableResponse>('admin-api/versions/table').then((r) => r.data);
}

// Fetches a single version by ID
export function getVersion(id: string): Promise<Version> {
  return axios.get<Version>(`admin-api/versions/${id}`).then((r) => r.data);
}

// Creates a new version
export function createVersion(data: CreateVersionData): Promise<CreateResponse<Version>> {
  return axios.post<CreateResponse<Version>>('admin-api/versions', data).then((r) => r.data);
}

// Updates a version's name and/or version string
export function updateVersion({ id, data }: { id: string; data: UpdateVersionData }): Promise<SuccessResponse> {
  return axios.patch<SuccessResponse>(`admin-api/versions/${id}`, data).then((r) => r.data);
}

// Builds a snapshot from all versioned tables
export function createSnapshot(id: string): Promise<SuccessResponse> {
  return axios.post<SuccessResponse>(`admin-api/versions/${id}/snapshot`).then((r) => r.data);
}

// Pushes build artifacts for a version
export function pushArtifacts(id: string, data: Record<string, unknown>): Promise<SuccessResponse> {
  return axios.post<SuccessResponse>(`admin-api/versions/${id}/artifacts`, data).then((r) => r.data);
}

// Deletes a version by ID
export function deleteVersion(id: string): Promise<void> {
  return axios.delete(`admin-api/versions/${id}`).then(() => undefined);
}
