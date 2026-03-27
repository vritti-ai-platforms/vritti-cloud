import type { SuccessResponse } from '@vritti/quantum-ui/api-response';
import { axios } from '@vritti/quantum-ui/axios';

// Fetches the permission types assigned to a feature
export function getFeaturePermissions(versionId: string, featureId: string): Promise<{ types: string[] }> {
  return axios.get<{ types: string[] }>(`admin-api/versions/${versionId}/features/${featureId}/permissions`).then((r) => r.data);
}

// Sets the permission types for a feature
export function setFeaturePermissions(versionId: string, featureId: string, types: string[]): Promise<SuccessResponse> {
  return axios.put<SuccessResponse>(`admin-api/versions/${versionId}/features/${featureId}/permissions`, { types }).then((r) => r.data);
}
