import { type UseMutationOptions, useMutation, useQueryClient } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import type { SuccessResponse } from '@vritti/quantum-ui/api-response';
import type { PurchaseAddonData } from '@/schemas/cloud/org-apps';
import { purchaseAddon } from '../../../services/cloud/org-apps.service';
import { ORG_APPS_QUERY_KEY } from './useOrgApps';

type PurchaseAddonVars = { orgId: string; appId: string; data: PurchaseAddonData };
type UsePurchaseAddonOptions = Omit<UseMutationOptions<SuccessResponse, AxiosError, PurchaseAddonVars>, 'mutationFn'>;

// Purchases an addon app for selected business units
export function usePurchaseAddon(options?: UsePurchaseAddonOptions) {
  const queryClient = useQueryClient();
  return useMutation<SuccessResponse, AxiosError, PurchaseAddonVars>({
    ...options,
    mutationFn: purchaseAddon,
    onSuccess: (result, vars, ...args) => {
      queryClient.invalidateQueries({ queryKey: ORG_APPS_QUERY_KEY(vars.orgId) });
      options?.onSuccess?.(result, vars, ...args);
    },
  });
}
