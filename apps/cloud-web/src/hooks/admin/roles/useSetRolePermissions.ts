import { type UseMutationOptions, useMutation, useQueryClient } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import type { SuccessResponse } from '@vritti/quantum-ui/api-response';
import type { SetPermissionsData } from '@/schemas/admin/roles';
import { setRolePermissions } from '../../../services/admin/roles.service';
import { roleQueryKey } from './useRole';
import { rolePermissionsQueryKey } from './useRolePermissions';
import { ROLES_QUERY_KEY } from './useRoles';

type Vars = { versionId: string; roleId: string; data: SetPermissionsData };
type UseSetRolePermissionsOptions = Omit<UseMutationOptions<SuccessResponse, AxiosError, Vars>, 'mutationFn'>;

// Sets permissions for a role and invalidates related queries
export function useSetRolePermissions(options?: UseSetRolePermissionsOptions) {
  const queryClient = useQueryClient();
  return useMutation<SuccessResponse, AxiosError, Vars>({
    ...options,
    mutationFn: setRolePermissions,
    onSuccess: (result, vars, ...args) => {
      queryClient.invalidateQueries({ queryKey: rolePermissionsQueryKey(vars.versionId, vars.roleId) });
      queryClient.invalidateQueries({ queryKey: roleQueryKey(vars.versionId, vars.roleId) });
      queryClient.invalidateQueries({ queryKey: ROLES_QUERY_KEY(vars.versionId) });
      options?.onSuccess?.(result, vars, ...args);
    },
  });
}
