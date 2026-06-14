import { type UseMutationOptions, useMutation, useQueryClient } from '@tanstack/react-query';
import type { SuccessResponse } from '@vritti/quantum-ui/api-response';
import type { AxiosError } from 'axios';
import type { UpsertPlanPriceData } from '@/schemas/admin/plan-prices';
import { upsertPlanPrice } from '@/services/admin/plan-prices.service';
import { planQueryKey } from '../plans';
import { planPricesQueryKey } from './usePlanPrices';

type Vars = { planId: string; data: UpsertPlanPriceData };
type UseUpsertPlanPriceOptions = Omit<UseMutationOptions<SuccessResponse, AxiosError, Vars>, 'mutationFn'>;

export function useUpsertPlanPrice(options?: UseUpsertPlanPriceOptions) {
  const queryClient = useQueryClient();
  return useMutation<SuccessResponse, AxiosError, Vars>({
    ...options,
    mutationFn: upsertPlanPrice,
    onSuccess: (result, vars, ...args) => {
      queryClient.invalidateQueries({ queryKey: planPricesQueryKey(vars.planId) });
      queryClient.invalidateQueries({ queryKey: planQueryKey(vars.planId) });
      options?.onSuccess?.(result, vars, ...args);
    },
  });
}
