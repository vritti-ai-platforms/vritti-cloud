import { type UseMutationOptions, useMutation, useQueryClient } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import type { SuccessResponse } from '@vritti/quantum-ui/api-response';
import type { SetPermissionsData } from '@/schemas/admin/role-templates';
import { setRoleTemplatePermissions } from '../../../services/admin/role-templates.service';
import { roleTemplateQueryKey } from './useRoleTemplate';
import { roleTemplatePermissionsQueryKey } from './useRoleTemplatePermissions';
import { ROLE_TEMPLATES_QUERY_KEY } from './useRoleTemplates';

type Vars = { versionId: string; roleId: string; data: SetPermissionsData };
type UseSetRoleTemplatePermissionsOptions = Omit<UseMutationOptions<SuccessResponse, AxiosError, Vars>, 'mutationFn'>;

export function useSetRoleTemplatePermissions(options?: UseSetRoleTemplatePermissionsOptions) {
  const queryClient = useQueryClient();
  return useMutation<SuccessResponse, AxiosError, Vars>({
    ...options,
    mutationFn: setRoleTemplatePermissions,
    onSuccess: (result, vars, ...args) => {
      queryClient.invalidateQueries({ queryKey: roleTemplatePermissionsQueryKey(vars.versionId, vars.roleId) });
      queryClient.invalidateQueries({ queryKey: roleTemplateQueryKey(vars.versionId, vars.roleId) });
      queryClient.invalidateQueries({ queryKey: ROLE_TEMPLATES_QUERY_KEY(vars.versionId) });
      options?.onSuccess?.(result, vars, ...args);
    },
  });
}
