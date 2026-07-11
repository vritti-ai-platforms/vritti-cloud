import { type UseQueryOptions, useQuery } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import type { RoleAssignment } from '@/schemas/cloud/role-assignments';
import {
  getRoleAssignments,
  type RoleAssignmentTarget,
  roleAssignmentTargetId,
} from '@/services/cloud/role-assignments.service';

export const ROLE_ASSIGNMENTS_QUERY_KEY = (target: RoleAssignmentTarget) =>
  ['organizations', target.orgId, 'role-assignments', target.kind, roleAssignmentTargetId(target)] as const;

type UseRoleAssignmentsOptions = Omit<UseQueryOptions<RoleAssignment[], AxiosError>, 'queryKey' | 'queryFn'>;

// Fetches role assignments for a target
export function useRoleAssignments(target: RoleAssignmentTarget, options?: UseRoleAssignmentsOptions) {
  return useQuery<RoleAssignment[], AxiosError>({
    queryKey: ROLE_ASSIGNMENTS_QUERY_KEY(target),
    queryFn: () => getRoleAssignments(target),
    enabled: !!target.orgId && !!roleAssignmentTargetId(target),
    ...options,
  });
}
