import type { CreateResponse, SuccessResponse } from '@vritti/quantum-ui/api-response';
import { axios } from '@vritti/quantum-ui/axios';
import type {
  CreatePermissionData,
  FeaturePermission,
  FeaturePermissionsTableResponse,
  UpdatePermissionData,
} from '@/schemas/admin/feature-permissions';

// Fetches all permissions owned by a feature for the data table
export function getFeaturePermissionsTable(
  versionId: string,
  featureId: string,
): Promise<FeaturePermissionsTableResponse> {
  return axios
    .get<FeaturePermissionsTableResponse>(`admin-api/versions/${versionId}/features/${featureId}/permissions/table`)
    .then((r) => r.data);
}

// Creates a version-level permission spanning one or more businesses
export function createPermission({
  versionId,
  data,
}: {
  versionId: string;
  data: CreatePermissionData;
}): Promise<CreateResponse<FeaturePermission>> {
  return axios
    .post<CreateResponse<FeaturePermission>>(`admin-api/versions/${versionId}/permissions`, data)
    .then((r) => r.data);
}

// Bulk-creates permissions in one request (Quick Add)
export function bulkCreatePermissions({
  versionId,
  permissions,
}: {
  versionId: string;
  permissions: CreatePermissionData[];
}): Promise<SuccessResponse> {
  return axios
    .post<SuccessResponse>(`admin-api/versions/${versionId}/permissions/bulk`, { permissions })
    .then((r) => r.data);
}

// Updates a version-level permission
export function updatePermission({
  versionId,
  permissionId,
  data,
}: {
  versionId: string;
  permissionId: string;
  data: UpdatePermissionData;
}): Promise<SuccessResponse> {
  return axios
    .patch<SuccessResponse>(`admin-api/versions/${versionId}/permissions/${permissionId}`, data)
    .then((r) => r.data);
}

// Deletes a version-level permission
export function deletePermission({
  versionId,
  permissionId,
}: {
  versionId: string;
  permissionId: string;
}): Promise<SuccessResponse> {
  return axios
    .delete<SuccessResponse>(`admin-api/versions/${versionId}/permissions/${permissionId}`)
    .then((r) => r.data);
}
