import { type UseMutationOptions, useMutation, useQueryClient } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import type { SuccessResponse } from '@vritti/quantum-ui/api-response';
import { removeRoleTemplateApp } from '../../../services/admin/role-templates.service';
import { featuresWithPermissionsQueryKey } from './useFeaturesWithPermissions';
import { roleTemplateQueryKey } from './useRoleTemplate';
import { roleTemplateAppsTableKey } from './useRoleTemplateAppsTable';

type Vars = { versionId: string; roleTemplateId: string; appId: string };
type UseRemoveRoleTemplateAppOptions = Omit<UseMutationOptions<SuccessResponse, AxiosError, Vars>, 'mutationFn'>;

// Removes an app from a role template and invalidates the features + detail queries
export function useRemoveRoleTemplateApp(options?: UseRemoveRoleTemplateAppOptions) {
  const queryClient = useQueryClient();
  return useMutation<SuccessResponse, AxiosError, Vars>({
    ...options,
    mutationFn: removeRoleTemplateApp,
    onSuccess: (result, vars, ...args) => {
      queryClient.invalidateQueries({ queryKey: roleTemplateAppsTableKey(vars.versionId, vars.roleTemplateId) });
      queryClient.invalidateQueries({ queryKey: featuresWithPermissionsQueryKey(vars.versionId, vars.roleTemplateId) });
      queryClient.invalidateQueries({ queryKey: roleTemplateQueryKey(vars.versionId, vars.roleTemplateId) });
      options?.onSuccess?.(result, vars, ...args);
    },
  });
}
