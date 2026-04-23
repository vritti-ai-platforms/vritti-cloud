import type { CreateResponse, SuccessResponse, TableResponse } from '@vritti/quantum-ui/api-response';
import { axios } from '@vritti/quantum-ui/axios';
import type {
  CreateRoleTemplateData,
  FeatureWithPermissions,
  GroupedPermission,
  Role,
  RoleTemplateAppTableRow,
  RoleTemplateDetail,
  RoleTemplatesTableResponse,
  SetPermissionsData,
  UpdateRoleTemplateData,
} from '@/schemas/admin/role-templates';

export function getRoleTemplates(versionId: string): Promise<RoleTemplatesTableResponse> {
  return axios.get<RoleTemplatesTableResponse>(`admin-api/versions/${versionId}/role-templates/table`).then((r) => r.data);
}

export function getRoleTemplate(versionId: string, id: string): Promise<RoleTemplateDetail> {
  return axios.get<RoleTemplateDetail>(`admin-api/versions/${versionId}/role-templates/${id}`).then((r) => r.data);
}

export function createRoleTemplate(versionId: string, data: CreateRoleTemplateData): Promise<CreateResponse<Role>> {
  return axios.post<CreateResponse<Role>>(`admin-api/versions/${versionId}/role-templates`, data).then((r) => r.data);
}

export function updateRoleTemplate(versionId: string, { id, data }: { id: string; data: UpdateRoleTemplateData }): Promise<SuccessResponse> {
  return axios.patch<SuccessResponse>(`admin-api/versions/${versionId}/role-templates/${id}`, data).then((r) => r.data);
}

export function deleteRoleTemplate(versionId: string, id: string): Promise<void> {
  return axios.delete(`admin-api/versions/${versionId}/role-templates/${id}`).then(() => undefined);
}

export function getFeaturesWithPermissions(versionId: string, roleTemplateId: string): Promise<FeatureWithPermissions[]> {
  return axios
    .get<FeatureWithPermissions[]>(`admin-api/versions/${versionId}/role-templates/${roleTemplateId}/permissions/features`)
    .then((r) => r.data);
}

export function getRoleTemplatePermissions(versionId: string, roleId: string): Promise<GroupedPermission[]> {
  return axios
    .get<GroupedPermission[]>(`admin-api/versions/${versionId}/role-templates/${roleId}/permissions`)
    .then((r) => r.data);
}

export function getRoleTemplateAppsTable(versionId: string, roleTemplateId: string): Promise<TableResponse<RoleTemplateAppTableRow>> {
  return axios
    .get<TableResponse<RoleTemplateAppTableRow>>(`admin-api/versions/${versionId}/role-templates/${roleTemplateId}/apps/table`)
    .then((r) => r.data);
}

export function addRoleTemplateApp({
  versionId,
  roleTemplateId,
  appId,
}: {
  versionId: string;
  roleTemplateId: string;
  appId: string;
}): Promise<SuccessResponse> {
  return axios.post<SuccessResponse>(`admin-api/versions/${versionId}/role-templates/${roleTemplateId}/apps/${appId}`).then((r) => r.data);
}

export function removeRoleTemplateApp({
  versionId,
  roleTemplateId,
  appId,
}: {
  versionId: string;
  roleTemplateId: string;
  appId: string;
}): Promise<SuccessResponse> {
  return axios.delete<SuccessResponse>(`admin-api/versions/${versionId}/role-templates/${roleTemplateId}/apps/${appId}`).then((r) => r.data);
}

export function setRoleTemplatePermissions({
  versionId,
  roleId,
  data,
}: {
  versionId: string;
  roleId: string;
  data: SetPermissionsData;
}): Promise<SuccessResponse> {
  return axios
    .put<SuccessResponse>(`admin-api/versions/${versionId}/role-templates/${roleId}/permissions`, data)
    .then((r) => r.data);
}
