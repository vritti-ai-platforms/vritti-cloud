import { type UseMutationOptions, useMutation, useQueryClient } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import { deleteOrgRole } from '../../../services/cloud/org-roles.service';
import { ORG_ROLES_QUERY_KEY } from './useOrgRoles';

type DeleteOrgRoleVars = { orgId: string; roleId: string };
type UseDeleteOrgRoleOptions = Omit<UseMutationOptions<void, AxiosError, DeleteOrgRoleVars>, 'mutationFn'>;

// Deletes a role from the organization and invalidates the roles list
export function useDeleteOrgRole(options?: UseDeleteOrgRoleOptions) {
  const queryClient = useQueryClient();
  return useMutation<void, AxiosError, DeleteOrgRoleVars>({
    ...options,
    mutationFn: deleteOrgRole,
    onSuccess: (result, vars, ...args) => {
      queryClient.invalidateQueries({ queryKey: ORG_ROLES_QUERY_KEY(vars.orgId) });
      options?.onSuccess?.(result, vars, ...args);
    },
  });
}
