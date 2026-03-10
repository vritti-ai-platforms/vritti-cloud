import { type UseMutationOptions, useMutation, useQueryClient } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import type { Price, UpdatePriceData } from '@/schemas/admin/prices';
import { updatePrice } from '@/services/admin/prices.service';
import { pricesTableQueryKey } from './usePricesTable';

type Vars = { id: string; planId: string; data: UpdatePriceData };
type UseUpdatePriceOptions = Omit<UseMutationOptions<Price, AxiosError, Vars>, 'mutationFn'>;

// Updates a price and invalidates the plan's prices table
export function useUpdatePrice(options?: UseUpdatePriceOptions) {
  const queryClient = useQueryClient();
  return useMutation<Price, AxiosError, Vars>({
    ...options,
    mutationFn: ({ id, data }) => updatePrice({ id, data }),
    onSuccess: (result, vars, ...args) => {
      queryClient.invalidateQueries({ queryKey: pricesTableQueryKey(vars.planId) });
      options?.onSuccess?.(result, vars, ...args);
    },
  });
}
