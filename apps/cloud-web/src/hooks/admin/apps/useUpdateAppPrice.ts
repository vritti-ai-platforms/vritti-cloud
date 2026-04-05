import { type UseMutationOptions, useMutation, useQueryClient } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import type { SuccessResponse } from '@vritti/quantum-ui/api-response';
import type { UpdateAppPriceData } from '@/schemas/admin/apps';
import { updateAppPrice } from '../../../services/admin/apps.service';
import { appQueryKey } from './useApp';
import { APP_PRICES_QUERY_KEY } from './useAppPrices';

type Vars = { versionId: string; appId: string; priceId: string; data: UpdateAppPriceData };
type UseUpdateAppPriceOptions = Omit<UseMutationOptions<SuccessResponse, AxiosError, Vars>, 'mutationFn'>;

// Updates an app price and invalidates the prices list + app detail
export function useUpdateAppPrice(options?: UseUpdateAppPriceOptions) {
  const queryClient = useQueryClient();
  return useMutation<SuccessResponse, AxiosError, Vars>({
    ...options,
    mutationFn: updateAppPrice,
    onSuccess: (result, vars, ...args) => {
      queryClient.invalidateQueries({ queryKey: APP_PRICES_QUERY_KEY(vars.versionId, vars.appId) });
      queryClient.invalidateQueries({ queryKey: appQueryKey(vars.versionId, vars.appId) });
      options?.onSuccess?.(result, vars, ...args);
    },
  });
}
