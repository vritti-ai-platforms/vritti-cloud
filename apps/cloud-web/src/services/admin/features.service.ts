import type { CreateResponse, SuccessResponse } from '@vritti/quantum-ui/api-response';
import { axios } from '@vritti/quantum-ui/axios';
import type { CreateFeatureData, Feature, FeaturesTableResponse, UpdateFeatureData } from '@/schemas/admin/features';
import type { ValidateImportResponse } from '@/schemas/admin/import';

// Fetches features for the data table — server applies filter/sort state
export function getFeatures(versionId: string): Promise<FeaturesTableResponse> {
  return axios.get<FeaturesTableResponse>(`admin-api/versions/${versionId}/features/table`).then((r) => r.data);
}

// Fetches a single feature by ID
export function getFeature(versionId: string, id: string): Promise<Feature> {
  return axios.get<Feature>(`admin-api/versions/${versionId}/features/${id}`).then((r) => r.data);
}

// Creates a new feature
export function createFeature(versionId: string, data: CreateFeatureData): Promise<CreateResponse<Feature>> {
  return axios.post<CreateResponse<Feature>>(`admin-api/versions/${versionId}/features`, data).then((r) => r.data);
}

// Updates a feature by ID
export function updateFeature(versionId: string, { id, data }: { id: string; data: UpdateFeatureData }): Promise<SuccessResponse> {
  return axios.patch<SuccessResponse>(`admin-api/versions/${versionId}/features/${id}`, data).then((r) => r.data);
}

// Deletes a feature by ID
export function deleteFeature(versionId: string, id: string): Promise<void> {
  return axios.delete(`admin-api/versions/${versionId}/features/${id}`).then(() => undefined);
}

// Uploads a file for validation and returns parsed rows with errors
export function validateFeatureImport(versionId: string, file: File): Promise<ValidateImportResponse> {
  const formData = new FormData();
  formData.append('file', file);
  return axios
    .post<ValidateImportResponse>(`admin-api/versions/${versionId}/features/validate`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      showSuccessToast: false,
    })
    .then((r) => r.data);
}

// Bulk creates features from validated data
export function bulkCreateFeatures(versionId: string, features: Record<string, string>[]): Promise<SuccessResponse> {
  return axios
    .post<SuccessResponse>(`admin-api/versions/${versionId}/features/bulk`, {
      features: features.map((f, i) => ({ ...f, versionId, sortOrder: i })),
    })
    .then((r) => r.data);
}
