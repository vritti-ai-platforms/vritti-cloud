import { type UseMutationOptions, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@vritti/quantum-ui/Sonner';
import type { SuccessResponse } from '@vritti/quantum-ui/types/api-response';
import type { AxiosError } from 'axios';
import { resetRole } from '../../../services/cloud/roles.service';
import { ROLES_QUERY_KEY } from './useRoles';

type ResetRoleVars = { orgId: string; roleId: string };
type UseResetRoleOptions = Omit<UseMutationOptions<SuccessResponse, AxiosError, ResetRoleVars>, 'mutationFn'>;

// Resets a custom role back to its template and invalidates the roles list
export function useResetRole(options?: UseResetRoleOptions) {
  const queryClient = useQueryClient();
  return useMutation<SuccessResponse, AxiosError, ResetRoleVars>({
    ...options,
    mutationFn: resetRole,
    onSuccess: (result, vars, ...args) => {
      queryClient.invalidateQueries({ queryKey: ROLES_QUERY_KEY(vars.orgId) });
      toast.success('Role reset to template.');
      options?.onSuccess?.(result, vars, ...args);
    },
  });
}
