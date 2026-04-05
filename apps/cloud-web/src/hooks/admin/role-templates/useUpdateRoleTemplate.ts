import { type UseMutationOptions, useMutation, useQueryClient } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import type { SuccessResponse } from '@vritti/quantum-ui/api-response';
import type { UpdateRoleTemplateData } from '@/schemas/admin/role-templates';
import { updateRoleTemplate } from '../../../services/admin/role-templates.service';
import { roleTemplateQueryKey } from './useRoleTemplate';
import { ROLE_TEMPLATES_QUERY_KEY } from './useRoleTemplates';

type UpdateRoleTemplateVars = { id: string; data: UpdateRoleTemplateData };
type UseUpdateRoleTemplateOptions = Omit<UseMutationOptions<SuccessResponse, AxiosError, UpdateRoleTemplateVars>, 'mutationFn'>;

export function useUpdateRoleTemplate(versionId: string, options?: UseUpdateRoleTemplateOptions) {
  const queryClient = useQueryClient();
  return useMutation<SuccessResponse, AxiosError, UpdateRoleTemplateVars>({
    ...options,
    mutationFn: (vars) => updateRoleTemplate(versionId, vars),
    onSuccess: (result, vars, ...args) => {
      queryClient.invalidateQueries({ queryKey: ROLE_TEMPLATES_QUERY_KEY(versionId) });
      queryClient.invalidateQueries({ queryKey: roleTemplateQueryKey(versionId, vars.id) });
      options?.onSuccess?.(result, vars, ...args);
    },
  });
}
