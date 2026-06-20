import { type UseMutationOptions, useMutation, useQueryClient } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import { deleteRoleTemplate } from '../../../services/admin/role-templates.service';
import { ROLE_TEMPLATES_QUERY_KEY } from './useRoleTemplates';

type UseDeleteRoleTemplateOptions = Omit<UseMutationOptions<void, AxiosError, string>, 'mutationFn'>;

// Deletes a role template and refreshes the business's role templates table
export function useDeleteRoleTemplate(versionId: string, businessId: string, options?: UseDeleteRoleTemplateOptions) {
  const queryClient = useQueryClient();
  return useMutation<void, AxiosError, string>({
    ...options,
    mutationFn: (id) => deleteRoleTemplate(versionId, businessId, id),
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: ROLE_TEMPLATES_QUERY_KEY(versionId, businessId) });
      options?.onSuccess?.(...args);
    },
  });
}
