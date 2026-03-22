import { type UseMutationOptions, useMutation, useQueryClient } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import type { SuccessResponse } from '@vritti/quantum-ui/api-response';
import { cancelAddon } from '../../../services/cloud/org-apps.service';
import { ORG_APPS_QUERY_KEY } from './useOrgApps';

type CancelAddonVars = { orgId: string; appId: string; businessUnitId: string };
type UseCancelAddonOptions = Omit<UseMutationOptions<SuccessResponse, AxiosError, CancelAddonVars>, 'mutationFn'>;

// Cancels an addon app subscription for a business unit
export function useCancelAddon(options?: UseCancelAddonOptions) {
  const queryClient = useQueryClient();
  return useMutation<SuccessResponse, AxiosError, CancelAddonVars>({
    ...options,
    mutationFn: cancelAddon,
    onSuccess: (result, vars, ...args) => {
      queryClient.invalidateQueries({ queryKey: ORG_APPS_QUERY_KEY(vars.orgId) });
      options?.onSuccess?.(result, vars, ...args);
    },
  });
}
