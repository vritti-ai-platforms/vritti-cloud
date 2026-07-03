import { type UseMutationOptions, useMutation, useQueryClient } from '@tanstack/react-query';
import type { CreateResponse } from '@vritti/quantum-ui/types/api-response';
import type { AxiosError } from 'axios';
import type { CreateRoleData, Role } from '@/schemas/cloud/roles';
import { createRole } from '../../../services/cloud/roles.service';
import { ROLES_QUERY_KEY } from './useRoles';

type CreateRoleVars = { orgId: string; data: CreateRoleData };
type UseCreateRoleOptions = Omit<UseMutationOptions<CreateResponse<Role>, AxiosError, CreateRoleVars>, 'mutationFn'>;

// Creates a new role in the organization and invalidates the roles list
export function useCreateRole(options?: UseCreateRoleOptions) {
  const queryClient = useQueryClient();
  return useMutation<CreateResponse<Role>, AxiosError, CreateRoleVars>({
    ...options,
    mutationFn: createRole,
    onSuccess: (result, vars, ...args) => {
      queryClient.invalidateQueries({ queryKey: ROLES_QUERY_KEY(vars.orgId) });
      options?.onSuccess?.(result, vars, ...args);
    },
  });
}
