import { type UseMutationOptions, useMutation, useQueryClient } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import { deleteRole } from '../../../services/admin/roles.service';
import { ROLES_QUERY_KEY } from './useRoles';

type UseDeleteRoleOptions = Omit<UseMutationOptions<void, AxiosError, string>, 'mutationFn'>;

// Deletes a role and invalidates the roles list
export function useDeleteRole(versionId: string, options?: UseDeleteRoleOptions) {
  const queryClient = useQueryClient();
  return useMutation<void, AxiosError, string>({
    ...options,
    mutationFn: (id) => deleteRole(versionId, id),
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: ROLES_QUERY_KEY(versionId) });
      options?.onSuccess?.(...args);
    },
  });
}
