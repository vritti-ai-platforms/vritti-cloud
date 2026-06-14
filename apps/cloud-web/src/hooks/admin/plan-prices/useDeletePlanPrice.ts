import { type UseMutationOptions, useMutation, useQueryClient } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import { deletePlanPrice } from '@/services/admin/plan-prices.service';
import { planQueryKey } from '../plans';
import { planPricesQueryKey } from './usePlanPrices';

type Vars = { planId: string; priceId: string };
type UseDeletePlanPriceOptions = Omit<UseMutationOptions<void, AxiosError, Vars>, 'mutationFn'>;

export function useDeletePlanPrice(options?: UseDeletePlanPriceOptions) {
  const queryClient = useQueryClient();
  return useMutation<void, AxiosError, Vars>({
    ...options,
    mutationFn: deletePlanPrice,
    onSuccess: (result, vars, ...args) => {
      queryClient.invalidateQueries({ queryKey: planPricesQueryKey(vars.planId) });
      queryClient.invalidateQueries({ queryKey: planQueryKey(vars.planId) });
      options?.onSuccess?.(result, vars, ...args);
    },
  });
}
