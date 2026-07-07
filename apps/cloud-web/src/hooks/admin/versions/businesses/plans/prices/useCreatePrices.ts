import { type UseMutationOptions, useMutation, useQueryClient } from '@tanstack/react-query';
import type { CreateResponse } from '@vritti/quantum-ui/types/api-response';
import type { AxiosError } from 'axios';
import type { CreatePricesData, PlanPrice } from '@/schemas/admin/prices';
import { createPrices } from '@/services/admin/versions/businesses/plans/prices.service';
import { pricesQueryKey } from './usePrices';

type Vars = { versionId: string; businessId: string; planId: string; data: CreatePricesData };
type UseCreatePricesOptions = Omit<UseMutationOptions<CreateResponse<PlanPrice[]>, AxiosError, Vars>, 'mutationFn'>;

export function useCreatePrices(options?: UseCreatePricesOptions) {
  const queryClient = useQueryClient();
  return useMutation<CreateResponse<PlanPrice[]>, AxiosError, Vars>({
    ...options,
    mutationFn: createPrices,
    onSuccess: (result, vars, ...args) => {
      queryClient.invalidateQueries({ queryKey: pricesQueryKey(vars.versionId, vars.businessId, vars.planId) });
      options?.onSuccess?.(result, vars, ...args);
    },
  });
}
