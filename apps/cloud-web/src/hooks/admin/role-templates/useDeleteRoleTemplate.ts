import { type UseMutationOptions, useMutation, useQueryClient } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import { deleteRoleTemplate } from '../../../services/admin/role-templates.service';
import { ROLE_TEMPLATES_QUERY_KEY } from './useRoleTemplates';

type UseDeleteRoleTemplateOptions = Omit<UseMutationOptions<void, AxiosError, string>, 'mutationFn'>;

export function useDeleteRoleTemplate(versionId: string, options?: UseDeleteRoleTemplateOptions) {
  const queryClient = useQueryClient();
  return useMutation<void, AxiosError, string>({
    ...options,
    mutationFn: (id) => deleteRoleTemplate(versionId, id),
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: ROLE_TEMPLATES_QUERY_KEY(versionId) });
      options?.onSuccess?.(...args);
    },
  });
}
