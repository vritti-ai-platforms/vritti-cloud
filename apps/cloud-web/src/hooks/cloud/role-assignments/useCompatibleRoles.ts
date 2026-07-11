import { type UseQueryOptions, useQuery } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import type { Role } from '@/schemas/cloud/roles';
import {
  getCompatibleRoles,
  type RoleAssignmentTarget,
  roleAssignmentTargetId,
} from '@/services/cloud/role-assignments.service';

export const COMPATIBLE_ROLES_QUERY_KEY = (target: RoleAssignmentTarget) =>
  ['organizations', target.orgId, 'compatible-roles', target.kind, roleAssignmentTargetId(target)] as const;

type UseCompatibleRolesOptions = Omit<UseQueryOptions<Role[], AxiosError>, 'queryKey' | 'queryFn'>;

// Fetches roles compatible with a target's scope
export function useCompatibleRoles(target: RoleAssignmentTarget, options?: UseCompatibleRolesOptions) {
  return useQuery<Role[], AxiosError>({
    queryKey: COMPATIBLE_ROLES_QUERY_KEY(target),
    queryFn: () => getCompatibleRoles(target),
    enabled: !!target.orgId && !!roleAssignmentTargetId(target),
    ...options,
  });
}
