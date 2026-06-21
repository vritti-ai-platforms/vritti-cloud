import { type UseMutationOptions, useMutation, useQueryClient } from '@tanstack/react-query';
import type { CreateResponse } from '@vritti/quantum-ui/api-response';
import type { AxiosError } from 'axios';
import type { CreateRoleTemplateData, Role } from '@/schemas/admin/role-templates';
import { createRoleTemplate } from '@/services/admin/versions/businesses/role-templates.service';
import { ROLE_TEMPLATES_QUERY_KEY } from './useRoleTemplates';

type UseCreateRoleTemplateOptions = Omit<
  UseMutationOptions<CreateResponse<Role>, AxiosError, CreateRoleTemplateData>,
  'mutationFn'
>;

// Creates a role template and refreshes the business's role templates table
export function useCreateRoleTemplate(versionId: string, businessId: string, options?: UseCreateRoleTemplateOptions) {
  const queryClient = useQueryClient();
  return useMutation<CreateResponse<Role>, AxiosError, CreateRoleTemplateData>({
    ...options,
    mutationFn: (data) => createRoleTemplate(versionId, businessId, data),
    onSuccess: (result, ...args) => {
      queryClient.invalidateQueries({ queryKey: ROLE_TEMPLATES_QUERY_KEY(versionId, businessId) });
      options?.onSuccess?.(result, ...args);
    },
  });
}
