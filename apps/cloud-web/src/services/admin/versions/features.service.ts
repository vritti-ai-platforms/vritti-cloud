import { axios } from '@vritti/quantum-ui/axios';
import type { CreateResponse, SuccessResponse } from '@vritti/quantum-ui/types/api-response';
import type {
  ChangeFeaturesScopeData,
  CreateFeatureData,
  Feature,
  FeaturesTableResponse,
  UpdateFeatureData,
} from '@/schemas/admin/features';

// Fetches features for the data table — server applies filter/sort state
export function getFeatures(versionId: string): Promise<FeaturesTableResponse> {
  return axios.get<FeaturesTableResponse>(`admin-api/versions/${versionId}/features/table`).then((r) => r.data);
}

// Fetches a single feature by ID
export function getFeature(versionId: string, id: string): Promise<Feature> {
  return axios.get<Feature>(`admin-api/versions/${versionId}/features/${id}`).then((r) => r.data);
}

// The form models each required service as its own switch; the API takes the service array
function toServices({ requiresGitea, ...rest }: { requiresGitea?: boolean }): Record<string, unknown> {
  return requiresGitea === undefined ? rest : { ...rest, services: requiresGitea ? ['GITEA'] : [] };
}

// Creates a new feature
export function createFeature(versionId: string, data: CreateFeatureData): Promise<CreateResponse<Feature>> {
  return axios
    .post<CreateResponse<Feature>>(`admin-api/versions/${versionId}/features`, toServices(data))
    .then((r) => r.data);
}

// Updates a feature by ID
export function updateFeature(
  versionId: string,
  { id, data }: { id: string; data: UpdateFeatureData },
): Promise<SuccessResponse> {
  return axios
    .patch<SuccessResponse>(`admin-api/versions/${versionId}/features/${id}`, toServices(data))
    .then((r) => r.data);
}

// Deletes a feature by ID
export function deleteFeature(versionId: string, id: string): Promise<void> {
  return axios.delete(`admin-api/versions/${versionId}/features/${id}`).then(() => undefined);
}

// Bulk-changes the scope of the given features
export function changeFeaturesScope(versionId: string, data: ChangeFeaturesScopeData): Promise<SuccessResponse> {
  return axios.patch<SuccessResponse>(`admin-api/versions/${versionId}/features/scope`, data).then((r) => r.data);
}
