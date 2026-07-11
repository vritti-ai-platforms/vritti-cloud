import { type UseMutationOptions, useMutation, useQueryClient } from '@tanstack/react-query';
import type { CreateResponse } from '@vritti/quantum-ui/types/api-response';
import type { AxiosError } from 'axios';
import type { AssignRoleData, RoleAssignment } from '@/schemas/cloud/role-assignments';
import { assignRole, type RoleAssignmentTarget } from '@/services/cloud/role-assignments.service';
import { ROLE_ASSIGNMENTS_QUERY_KEY } from './useRoleAssignments';

type AssignRoleVars = { target: RoleAssignmentTarget; data: AssignRoleData };
type UseAssignRoleOptions = Omit<
  UseMutationOptions<CreateResponse<RoleAssignment>, AxiosError, AssignRoleVars>,
  'mutationFn'
>;

// Assigns (or replaces) a user's role at a target and refreshes the assignment list
export function useAssignRole(options?: UseAssignRoleOptions) {
  const queryClient = useQueryClient();
  return useMutation<CreateResponse<RoleAssignment>, AxiosError, AssignRoleVars>({
    ...options,
    mutationFn: assignRole,
    onSuccess: (result, vars, ...args) => {
      queryClient.invalidateQueries({ queryKey: ROLE_ASSIGNMENTS_QUERY_KEY(vars.target) });
      options?.onSuccess?.(result, vars, ...args);
    },
  });
}
