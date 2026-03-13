import { type UseMutationOptions, useMutation, useQueryClient } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import type { MutationResponse } from '@vritti/quantum-ui/api-response';
import type { CreatePriceData } from '@/schemas/admin/prices';
import { createPrice } from '@/services/admin/prices.service';
import { planQueryKey } from '../plans';
import { pricesTableQueryKey } from './usePricesTable';
type UseCreatePriceOptions = Omit<UseMutationOptions<MutationResponse, AxiosError, CreatePriceData>, 'mutationFn'>;

// Creates a new price and invalidates the plan's prices table
export function useCreatePrice(options?: UseCreatePriceOptions) {
  const queryClient = useQueryClient();
  return useMutation<MutationResponse, AxiosError, CreatePriceData>({
    ...options,
    mutationFn: createPrice,
    onSuccess: (result, vars, ...args) => {
      queryClient.invalidateQueries({ queryKey: pricesTableQueryKey(vars.planId) });
      queryClient.invalidateQueries({ queryKey: planQueryKey(vars.planId) });
      options?.onSuccess?.(result, vars, ...args);
    },
  });
}
