import { axios } from '@vritti/quantum-ui/axios';
import type { CreateResponse, SuccessResponse } from '@vritti/quantum-ui/types/api-response';
import type {
  CreatePermissionData,
  FeaturePermission,
  PermissionUsage,
  UpdatePermissionData,
} from '@/schemas/admin/feature-permissions';

// Fetches all permissions owned by a feature, ordered by sortOrder
export function getFeaturePermissions(versionId: string, featureId: string): Promise<FeaturePermission[]> {
  return axios
    .get<FeaturePermission[]>(`admin-api/versions/${versionId}/features/${featureId}/permissions`)
    .then((r) => r.data);
}

// Persists a new manual ordering of a feature's permissions
export function reorderPermissions({
  versionId,
  featureId,
  orderedIds,
}: {
  versionId: string;
  featureId: string;
  orderedIds: string[];
}): Promise<SuccessResponse> {
  return axios
    .patch<SuccessResponse>(`admin-api/versions/${versionId}/features/${featureId}/permissions/reorder`, {
      orderedIds,
    })
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

// Fetches the business-wise usage (plans + role templates) of a permission
export function getPermissionUsage(versionId: string, permissionId: string): Promise<PermissionUsage> {
  return axios
    .get<PermissionUsage>(`admin-api/versions/${versionId}/permissions/${permissionId}/usage`)
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
