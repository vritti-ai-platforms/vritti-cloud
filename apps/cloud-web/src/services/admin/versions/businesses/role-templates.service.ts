import { axios } from '@vritti/quantum-ui/axios';
import type { CreateResponse, SuccessResponse } from '@vritti/quantum-ui/types/api-response';
import type {
  CreateRoleTemplateData,
  Role,
  RoleTemplateDetail,
  RoleTemplatePermissionsResponse,
  RoleTemplatesTableResponse,
  SetPermissionsData,
  UpdateRoleTemplateData,
} from '@/schemas/admin/role-templates';

// Fetches a business's role templates for the data table
export function getRoleTemplates(versionId: string, businessId: string): Promise<RoleTemplatesTableResponse> {
  return axios
    .get<RoleTemplatesTableResponse>(`admin-api/versions/${versionId}/businesses/${businessId}/role-templates/table`)
    .then((r) => r.data);
}

// Fetches a single role template with its detail (counts + apps)
export function getRoleTemplate(versionId: string, businessId: string, id: string): Promise<RoleTemplateDetail> {
  return axios
    .get<RoleTemplateDetail>(`admin-api/versions/${versionId}/businesses/${businessId}/role-templates/${id}`)
    .then((r) => r.data);
}

// Creates a role template for a business
export function createRoleTemplate(
  versionId: string,
  businessId: string,
  data: CreateRoleTemplateData,
): Promise<CreateResponse<Role>> {
  return axios
    .post<CreateResponse<Role>>(`admin-api/versions/${versionId}/businesses/${businessId}/role-templates`, data)
    .then((r) => r.data);
}

// Updates a role template (details + apps)
export function updateRoleTemplate(
  versionId: string,
  businessId: string,
  { id, data }: { id: string; data: UpdateRoleTemplateData },
): Promise<SuccessResponse> {
  return axios
    .patch<SuccessResponse>(`admin-api/versions/${versionId}/businesses/${businessId}/role-templates/${id}`, data)
    .then((r) => r.data);
}

// Deletes a role template
export function deleteRoleTemplate(versionId: string, businessId: string, id: string): Promise<void> {
  return axios
    .delete(`admin-api/versions/${versionId}/businesses/${businessId}/role-templates/${id}`)
    .then(() => undefined);
}

// Fetches the matrix — apps (catalog) each with the role's current grants nested
export function getRoleTemplatePermissions(
  versionId: string,
  businessId: string,
  roleId: string,
): Promise<RoleTemplatePermissionsResponse> {
  return axios
    .get<RoleTemplatePermissionsResponse>(
      `admin-api/versions/${versionId}/businesses/${businessId}/role-templates/${roleId}/permissions`,
    )
    .then((r) => r.data);
}

// Replaces a role template's grants (each with its granted permissions)
export function setRoleTemplatePermissions({
  versionId,
  businessId,
  roleId,
  data,
}: {
  versionId: string;
  businessId: string;
  roleId: string;
  data: SetPermissionsData;
}): Promise<SuccessResponse> {
  return axios
    .put<SuccessResponse>(
      `admin-api/versions/${versionId}/businesses/${businessId}/role-templates/${roleId}/permissions`,
      data,
    )
    .then((r) => r.data);
}
