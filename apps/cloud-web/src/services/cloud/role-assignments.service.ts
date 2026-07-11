import { axios } from '@vritti/quantum-ui/axios';
import type { CreateResponse, SuccessResponse } from '@vritti/quantum-ui/types/api-response';
import type { AssignRoleData, RoleAssignment } from '@/schemas/cloud/role-assignments';
import type { Role } from '@/schemas/cloud/roles';

export type RoleAssignmentTarget =
  | { kind: 'org'; orgId: string }
  | { kind: 'legalEntity'; orgId: string; leId: string }
  | { kind: 'siteGroup'; orgId: string; groupId: string }
  | { kind: 'site'; orgId: string; siteId: string };

// Resolves the target's base API path
function targetUrl(target: RoleAssignmentTarget): string {
  switch (target.kind) {
    case 'org':
      return `cloud-api/organizations/${target.orgId}`;
    case 'legalEntity':
      return `cloud-api/organizations/${target.orgId}/legal-entities/${target.leId}`;
    case 'siteGroup':
      return `cloud-api/organizations/${target.orgId}/site-groups/${target.groupId}`;
    case 'site':
      return `cloud-api/organizations/${target.orgId}/sites/${target.siteId}`;
  }
}

// Resolves the target-specific entity ID for query keys
export function roleAssignmentTargetId(target: RoleAssignmentTarget): string {
  switch (target.kind) {
    case 'org':
      return target.orgId;
    case 'legalEntity':
      return target.leId;
    case 'siteGroup':
      return target.groupId;
    case 'site':
      return target.siteId;
  }
}

// Fetches role assignments for a target
export function getRoleAssignments(target: RoleAssignmentTarget): Promise<RoleAssignment[]> {
  return axios.get<RoleAssignment[]>(`${targetUrl(target)}/role-assignments`).then((r) => r.data);
}

// Assigns (or replaces) a user's role at a target
export function assignRole({
  target,
  data,
}: {
  target: RoleAssignmentTarget;
  data: AssignRoleData;
}): Promise<CreateResponse<RoleAssignment>> {
  return axios.post<CreateResponse<RoleAssignment>>(`${targetUrl(target)}/role-assignments`, data).then((r) => r.data);
}

// Removes a role assignment from a target
export function removeRoleAssignment({
  target,
  assignmentId,
}: {
  target: RoleAssignmentTarget;
  assignmentId: string;
}): Promise<SuccessResponse> {
  return axios.delete<SuccessResponse>(`${targetUrl(target)}/role-assignments/${assignmentId}`).then((r) => r.data);
}

// Fetches roles compatible with a target's scope
export function getCompatibleRoles(target: RoleAssignmentTarget): Promise<Role[]> {
  return axios.get<Role[]>(`${targetUrl(target)}/compatible-roles`).then((r) => r.data);
}
