import { axios } from '@vritti/quantum-ui/axios';
import type { CreateResponse, SuccessResponse } from '@vritti/quantum-ui/types/api-response';
import type { CreateRoleData, Role, RoleScopeSection, UpdateRoleData } from '@/schemas/cloud/roles';

// Fetches the organization's roles as render-ready sections (templates + custom roles per scope)
export function getRoles(orgId: string): Promise<RoleScopeSection[]> {
  return axios.get<RoleScopeSection[]>(`cloud-api/organizations/${orgId}/roles`).then((r) => r.data);
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
