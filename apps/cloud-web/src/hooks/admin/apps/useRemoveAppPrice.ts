import { type UseMutationOptions, useMutation, useQueryClient } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import { removeAppPrice } from '../../../services/admin/apps.service';
import { appQueryKey } from './useApp';
import { APP_PRICES_QUERY_KEY } from './useAppPrices';

type Vars = { versionId: string; appId: string; priceId: string };
type UseRemoveAppPriceOptions = Omit<UseMutationOptions<void, AxiosError, Vars>, 'mutationFn'>;

// Removes a price from an app and invalidates the prices list + app detail
export function useRemoveAppPrice(options?: UseRemoveAppPriceOptions) {
  const queryClient = useQueryClient();
  return useMutation<void, AxiosError, Vars>({
    ...options,
    mutationFn: removeAppPrice,
    onSuccess: (result, vars, ...args) => {
      queryClient.invalidateQueries({ queryKey: APP_PRICES_QUERY_KEY(vars.versionId, vars.appId) });
      queryClient.invalidateQueries({ queryKey: appQueryKey(vars.versionId, vars.appId) });
      options?.onSuccess?.(result, vars, ...args);
    },
  });
}
