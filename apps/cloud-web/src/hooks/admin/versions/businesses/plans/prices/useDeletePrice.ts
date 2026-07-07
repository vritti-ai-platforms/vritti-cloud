import { type UseMutationOptions, useMutation, useQueryClient } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import { deletePrice } from '@/services/admin/versions/businesses/plans/prices.service';
import { pricesQueryKey } from './usePrices';

type Vars = { versionId: string; businessId: string; planId: string; priceId: string };
type UseDeletePriceOptions = Omit<UseMutationOptions<void, AxiosError, Vars>, 'mutationFn'>;

export function useDeletePrice(options?: UseDeletePriceOptions) {
  const queryClient = useQueryClient();
  return useMutation<void, AxiosError, Vars>({
    ...options,
    mutationFn: deletePrice,
    onSuccess: (result, vars, ...args) => {
      queryClient.invalidateQueries({ queryKey: pricesQueryKey(vars.versionId, vars.businessId, vars.planId) });
      options?.onSuccess?.(result, vars, ...args);
    },
  });
}
