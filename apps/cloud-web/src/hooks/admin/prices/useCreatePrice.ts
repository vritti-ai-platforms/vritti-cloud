import { type UseMutationOptions, useMutation, useQueryClient } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import type { CreatePriceData, Price } from '@/schemas/admin/prices';
import { createPrice } from '@/services/admin/prices.service';
import { pricesTableQueryKey } from './usePricesTable';

type UseCreatePriceOptions = Omit<UseMutationOptions<Price, AxiosError, CreatePriceData>, 'mutationFn'>;

// Creates a new price and invalidates the plan's prices table
export function useCreatePrice(options?: UseCreatePriceOptions) {
  const queryClient = useQueryClient();
  return useMutation<Price, AxiosError, CreatePriceData>({
    ...options,
    mutationFn: createPrice,
    onSuccess: (result, vars, ...args) => {
      queryClient.invalidateQueries({ queryKey: pricesTableQueryKey(vars.planId) });
      options?.onSuccess?.(result, vars, ...args);
    },
  });
}
