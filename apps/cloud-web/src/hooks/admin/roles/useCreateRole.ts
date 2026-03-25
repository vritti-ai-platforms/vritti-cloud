import { type UseMutationOptions, useMutation, useQueryClient } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import type { CreateResponse } from '@vritti/quantum-ui/api-response';
import type { CreateRoleData, Role } from '@/schemas/admin/roles';
import { createRole } from '../../../services/admin/roles.service';
import { ROLES_QUERY_KEY } from './useRoles';

type UseCreateRoleOptions = Omit<UseMutationOptions<CreateResponse<Role>, AxiosError, CreateRoleData>, 'mutationFn'>;

// Creates a new role and invalidates the roles list
export function useCreateRole(versionId: string, options?: UseCreateRoleOptions) {
  const queryClient = useQueryClient();
  return useMutation<CreateResponse<Role>, AxiosError, CreateRoleData>({
    ...options,
    mutationFn: (data) => createRole(versionId, data),
    onSuccess: (result, ...args) => {
      queryClient.invalidateQueries({ queryKey: ROLES_QUERY_KEY(versionId) });
      options?.onSuccess?.(result, ...args);
    },
  });
}
