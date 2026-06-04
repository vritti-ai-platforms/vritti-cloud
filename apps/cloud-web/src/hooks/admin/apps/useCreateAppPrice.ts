import { type UseMutationOptions, useMutation, useQueryClient } from '@tanstack/react-query';
import type { CreateResponse } from '@vritti/quantum-ui/api-response';
import type { AxiosError } from 'axios';
import type { AddAppPriceData, AppPrice } from '@/schemas/admin/apps';
import { createAppPrice } from '../../../services/admin/apps.service';
import { appQueryKey } from './useApp';
import { APP_PRICES_QUERY_KEY } from './useAppPrices';

type Vars = { versionId: string; appId: string; data: AddAppPriceData };
type UseCreateAppPriceOptions = Omit<UseMutationOptions<CreateResponse<AppPrice>, AxiosError, Vars>, 'mutationFn'>;

// Creates a price for an app and invalidates the prices list + app detail
export function useCreateAppPrice(options?: UseCreateAppPriceOptions) {
  const queryClient = useQueryClient();
  return useMutation<CreateResponse<AppPrice>, AxiosError, Vars>({
    ...options,
    mutationFn: createAppPrice,
    onSuccess: (result, vars, ...args) => {
      queryClient.invalidateQueries({ queryKey: APP_PRICES_QUERY_KEY(vars.versionId, vars.appId) });
      queryClient.invalidateQueries({ queryKey: appQueryKey(vars.versionId, vars.appId) });
      options?.onSuccess?.(result, vars, ...args);
    },
  });
}
