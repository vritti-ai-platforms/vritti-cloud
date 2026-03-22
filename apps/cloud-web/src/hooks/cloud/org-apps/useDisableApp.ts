import { type UseMutationOptions, useMutation, useQueryClient } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import type { SuccessResponse } from '@vritti/quantum-ui/api-response';
import { disableOrgApp } from '../../../services/cloud/org-apps.service';
import { ORG_APPS_QUERY_KEY } from './useOrgApps';

type DisableAppVars = { orgId: string; appId: string };
type UseDisableAppOptions = Omit<UseMutationOptions<SuccessResponse, AxiosError, DisableAppVars>, 'mutationFn'>;

// Disables an app for the organization and invalidates the apps list
export function useDisableApp(options?: UseDisableAppOptions) {
  const queryClient = useQueryClient();
  return useMutation<SuccessResponse, AxiosError, DisableAppVars>({
    ...options,
    mutationFn: disableOrgApp,
    onSuccess: (result, vars, ...args) => {
      queryClient.invalidateQueries({ queryKey: ORG_APPS_QUERY_KEY(vars.orgId) });
      options?.onSuccess?.(result, vars, ...args);
    },
  });
}
