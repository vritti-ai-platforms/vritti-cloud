import type { CreateResponse, SuccessResponse } from '@vritti/quantum-ui/api-response';
import { axios } from '@vritti/quantum-ui/axios';
import type {
  CreateRoleData,
  FeatureWithPermissions,
  GroupedPermission,
  Role,
  RoleDetail,
  RolesTableResponse,
  SetPermissionsData,
  UpdateRoleData,
} from '@/schemas/admin/roles';

// Fetches roles for the data table — server applies filter/sort state
export function getRoles(versionId: string): Promise<RolesTableResponse> {
  return axios.get<RolesTableResponse>(`admin-api/app-versions/${versionId}/roles/table`).then((r) => r.data);
}

// Fetches a single role by ID with permissions
export function getRole(versionId: string, id: string): Promise<RoleDetail> {
  return axios.get<RoleDetail>(`admin-api/app-versions/${versionId}/roles/${id}`).then((r) => r.data);
}

// Creates a new role
export function createRole(versionId: string, data: CreateRoleData): Promise<CreateResponse<Role>> {
  return axios.post<CreateResponse<Role>>(`admin-api/app-versions/${versionId}/roles`, data).then((r) => r.data);
}

// Updates a role by ID
export function updateRole(versionId: string, { id, data }: { id: string; data: UpdateRoleData }): Promise<SuccessResponse> {
  return axios.patch<SuccessResponse>(`admin-api/app-versions/${versionId}/roles/${id}`, data).then((r) => r.data);
}

// Deletes a role by ID
export function deleteRole(versionId: string, id: string): Promise<void> {
  return axios.delete(`admin-api/app-versions/${versionId}/roles/${id}`).then(() => undefined);
}

// Fetches all features with their available permission types for a version
export function getFeaturesWithPermissions(versionId: string): Promise<FeatureWithPermissions[]> {
  return axios
    .get<FeatureWithPermissions[]>(`admin-api/app-versions/${versionId}/features/with-permissions`)
    .then((r) => r.data);
}

// Fetches grouped permissions for a role
export function getRolePermissions(versionId: string, roleId: string): Promise<GroupedPermission[]> {
  return axios
    .get<GroupedPermission[]>(`admin-api/app-versions/${versionId}/roles/${roleId}/permissions`)
    .then((r) => r.data);
}

// Sets permissions for a role (replaces all)
export function setRolePermissions({
  versionId,
  roleId,
  data,
}: {
  versionId: string;
  roleId: string;
  data: SetPermissionsData;
}): Promise<SuccessResponse> {
  return axios
    .put<SuccessResponse>(`admin-api/app-versions/${versionId}/roles/${roleId}/permissions`, data)
    .then((r) => r.data);
}
