import type { CreateResponse, SuccessResponse } from '@vritti/quantum-ui/api-response';
import { axios } from '@vritti/quantum-ui/axios';
import type { CreateRoleData, Role, RoleTemplate, UpdateRoleData } from '@/schemas/cloud/roles';

// Fetches all roles for the organization
export function getRoles(orgId: string): Promise<Role[]> {
  return axios.get<Role[]>(`cloud-api/organizations/${orgId}/roles`).then((r) => r.data);
}

// Creates a new role in the organization
export function createRole({ orgId, data }: { orgId: string; data: CreateRoleData }): Promise<CreateResponse<Role>> {
  return axios.post<CreateResponse<Role>>(`cloud-api/organizations/${orgId}/roles`, data).then((r) => r.data);
}

// Updates a role in the organization
export function updateRole({
  orgId,
  roleId,
  data,
}: {
  orgId: string;
  roleId: string;
  data: UpdateRoleData;
}): Promise<SuccessResponse> {
  return axios.patch<SuccessResponse>(`cloud-api/organizations/${orgId}/roles/${roleId}`, data).then((r) => r.data);
}

// Deletes a role from the organization
export function deleteRole({ orgId, roleId }: { orgId: string; roleId: string }): Promise<void> {
  return axios.delete(`cloud-api/organizations/${orgId}/roles/${roleId}`).then(() => undefined);
}

// Fetches available role templates for the organization
export function getRoleTemplates(orgId: string): Promise<RoleTemplate[]> {
  return axios
    .get<{ result: RoleTemplate[] }>(`cloud-api/organizations/${orgId}/roles/templates`)
    .then((r) => r.data.result);
}
