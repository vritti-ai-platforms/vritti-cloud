import { type UseMutationOptions, useMutation, useQueryClient } from '@tanstack/react-query';
import type { SuccessResponse } from '@vritti/quantum-ui/types/api-response';
import type { AxiosError } from 'axios';
import type { UpdateRoleData } from '@/schemas/cloud/roles';
import { updateRole } from '../../../services/cloud/roles.service';
import { ROLES_QUERY_KEY } from './useRoles';

type UpdateRoleVars = { orgId: string; roleId: string; data: UpdateRoleData };
type UseUpdateRoleOptions = Omit<UseMutationOptions<SuccessResponse, AxiosError, UpdateRoleVars>, 'mutationFn'>;

// Updates a role in the organization and invalidates the roles list
export function useUpdateRole(options?: UseUpdateRoleOptions) {
  const queryClient = useQueryClient();
  return useMutation<SuccessResponse, AxiosError, UpdateRoleVars>({
    ...options,
    mutationFn: updateRole,
    onSuccess: (result, vars, ...args) => {
      queryClient.invalidateQueries({ queryKey: ROLES_QUERY_KEY(vars.orgId) });
      options?.onSuccess?.(result, vars, ...args);
    },
  });
}
