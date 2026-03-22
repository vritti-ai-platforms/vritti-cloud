import type { SuccessResponse } from '@vritti/quantum-ui/api-response';
import { axios } from '@vritti/quantum-ui/axios';
import type { CreateFeatureData, Feature, FeaturesTableResponse, UpdateFeatureData } from '@/schemas/admin/features';

// Fetches features for the data table — server applies filter/sort state
export function getFeatures(versionId: string): Promise<FeaturesTableResponse> {
  return axios.get<FeaturesTableResponse>(`admin-api/app-versions/${versionId}/features/table`).then((r) => r.data);
}

// Fetches a single feature by ID
export function getFeature(versionId: string, id: string): Promise<Feature> {
  return axios.get<Feature>(`admin-api/app-versions/${versionId}/features/${id}`).then((r) => r.data);
}

// Creates a new feature
export function createFeature(versionId: string, data: CreateFeatureData): Promise<Feature> {
  return axios.post<Feature>(`admin-api/app-versions/${versionId}/features`, data).then((r) => r.data);
}

// Updates a feature by ID
export function updateFeature(versionId: string, { id, data }: { id: string; data: UpdateFeatureData }): Promise<SuccessResponse> {
  return axios.patch<SuccessResponse>(`admin-api/app-versions/${versionId}/features/${id}`, data).then((r) => r.data);
}

// Deletes a feature by ID
export function deleteFeature(versionId: string, id: string): Promise<void> {
  return axios.delete(`admin-api/app-versions/${versionId}/features/${id}`).then(() => undefined);
}
