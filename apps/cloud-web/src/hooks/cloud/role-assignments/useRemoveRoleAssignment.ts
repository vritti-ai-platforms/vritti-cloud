import { type UseMutationOptions, useMutation, useQueryClient } from '@tanstack/react-query';
import type { SuccessResponse } from '@vritti/quantum-ui/types/api-response';
import type { AxiosError } from 'axios';
import { type RoleAssignmentTarget, removeRoleAssignment } from '@/services/cloud/role-assignments.service';
import { ROLE_ASSIGNMENTS_QUERY_KEY } from './useRoleAssignments';

type RemoveRoleAssignmentVars = { target: RoleAssignmentTarget; assignmentId: string };
type UseRemoveRoleAssignmentOptions = Omit<
  UseMutationOptions<SuccessResponse, AxiosError, RemoveRoleAssignmentVars>,
  'mutationFn'
>;

// Removes a role assignment from a target and refreshes the assignment list
export function useRemoveRoleAssignment(options?: UseRemoveRoleAssignmentOptions) {
  const queryClient = useQueryClient();
  return useMutation<SuccessResponse, AxiosError, RemoveRoleAssignmentVars>({
    ...options,
    mutationFn: removeRoleAssignment,
    onSuccess: (result, vars, ...args) => {
      queryClient.invalidateQueries({ queryKey: ROLE_ASSIGNMENTS_QUERY_KEY(vars.target) });
      options?.onSuccess?.(result, vars, ...args);
    },
  });
}
