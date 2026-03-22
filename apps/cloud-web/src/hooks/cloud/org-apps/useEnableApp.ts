import { type UseMutationOptions, useMutation, useQueryClient } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import type { SuccessResponse } from '@vritti/quantum-ui/api-response';
import { enableOrgApp } from '../../../services/cloud/org-apps.service';
import { ORG_APPS_QUERY_KEY } from './useOrgApps';

type EnableAppVars = { orgId: string; appId: string };
type UseEnableAppOptions = Omit<UseMutationOptions<SuccessResponse, AxiosError, EnableAppVars>, 'mutationFn'>;

// Enables an app for the organization and invalidates the apps list
export function useEnableApp(options?: UseEnableAppOptions) {
  const queryClient = useQueryClient();
  return useMutation<SuccessResponse, AxiosError, EnableAppVars>({
    ...options,
    mutationFn: enableOrgApp,
    onSuccess: (result, vars, ...args) => {
      queryClient.invalidateQueries({ queryKey: ORG_APPS_QUERY_KEY(vars.orgId) });
      options?.onSuccess?.(result, vars, ...args);
    },
  });
}
