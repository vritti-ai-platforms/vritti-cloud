import { axios } from '@vritti/quantum-ui/axios';
import type { SuccessResponse } from '@vritti/quantum-ui/api-response';
import type { CreateOrgRoleData, OrgRole, RoleTemplate, UpdateOrgRoleData } from '@/schemas/cloud/org-roles';

// Fetches all roles for the organization
export function getOrgRoles(orgId: string): Promise<OrgRole[]> {
  return axios.get<OrgRole[]>(`cloud-api/organizations/${orgId}/roles`).then((r) => r.data);
}

// Creates a new role in the organization
export function createOrgRole({ orgId, data }: { orgId: string; data: CreateOrgRoleData }): Promise<OrgRole> {
  return axios.post<OrgRole>(`cloud-api/organizations/${orgId}/roles`, data).then((r) => r.data);
}

// Updates a role in the organization
export function updateOrgRole({
  orgId,
  roleId,
  data,
}: {
  orgId: string;
  roleId: string;
  data: UpdateOrgRoleData;
}): Promise<SuccessResponse> {
  return axios
    .patch<SuccessResponse>(`cloud-api/organizations/${orgId}/roles/${roleId}`, data)
    .then((r) => r.data);
}

// Deletes a role from the organization
export function deleteOrgRole({ orgId, roleId }: { orgId: string; roleId: string }): Promise<void> {
  return axios.delete(`cloud-api/organizations/${orgId}/roles/${roleId}`).then(() => undefined);
}

// Fetches available role templates for the organization
export function getOrgRoleTemplates(orgId: string): Promise<RoleTemplate[]> {
  return axios
    .get<{ result: RoleTemplate[] }>(`cloud-api/organizations/${orgId}/roles/templates`)
    .then((r) => r.data.result);
}
