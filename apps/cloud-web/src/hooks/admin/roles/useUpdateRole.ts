import { type UseMutationOptions, useMutation, useQueryClient } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import type { SuccessResponse } from '@vritti/quantum-ui/api-response';
import type { UpdateRoleData } from '@/schemas/admin/roles';
import { updateRole } from '../../../services/admin/roles.service';
import { roleQueryKey } from './useRole';
import { ROLES_QUERY_KEY } from './useRoles';

type UpdateRoleVars = { id: string; data: UpdateRoleData };
type UseUpdateRoleOptions = Omit<UseMutationOptions<SuccessResponse, AxiosError, UpdateRoleVars>, 'mutationFn'>;

// Updates a role and invalidates the roles list and detail
export function useUpdateRole(versionId: string, options?: UseUpdateRoleOptions) {
  const queryClient = useQueryClient();
  return useMutation<SuccessResponse, AxiosError, UpdateRoleVars>({
    ...options,
    mutationFn: (vars) => updateRole(versionId, vars),
    onSuccess: (result, vars, ...args) => {
      queryClient.invalidateQueries({ queryKey: ROLES_QUERY_KEY(versionId) });
      queryClient.invalidateQueries({ queryKey: roleQueryKey(versionId, vars.id) });
      options?.onSuccess?.(result, vars, ...args);
    },
  });
}
