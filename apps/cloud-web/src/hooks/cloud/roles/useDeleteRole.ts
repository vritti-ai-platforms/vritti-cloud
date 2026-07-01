import { type UseMutationOptions, useMutation, useQueryClient } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import { deleteRole } from '../../../services/cloud/roles.service';
import { ROLES_QUERY_KEY } from './useRoles';

type DeleteRoleVars = { orgId: string; roleId: string };
type UseDeleteRoleOptions = Omit<UseMutationOptions<void, AxiosError, DeleteRoleVars>, 'mutationFn'>;

// Deletes a role from the organization and invalidates the roles list
export function useDeleteRole(options?: UseDeleteRoleOptions) {
  const queryClient = useQueryClient();
  return useMutation<void, AxiosError, DeleteRoleVars>({
    ...options,
    mutationFn: deleteRole,
    onSuccess: (result, vars, ...args) => {
      queryClient.invalidateQueries({ queryKey: ROLES_QUERY_KEY(vars.orgId) });
      options?.onSuccess?.(result, vars, ...args);
    },
  });
}
