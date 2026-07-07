import { type UseMutationOptions, useMutation, useQueryClient } from '@tanstack/react-query';
import type { CreateResponse } from '@vritti/quantum-ui/types/api-response';
import type { AxiosError } from 'axios';
import type { BillingCycle, CreateBillingCycleData } from '@/schemas/admin/billing-cycles';
import { createBillingCycle } from '@/services/admin/billing-cycles.service';
import { BILLING_CYCLES_QUERY_KEY } from './useBillingCycles';

type UseCreateBillingCycleOptions = Omit<
  UseMutationOptions<CreateResponse<BillingCycle>, AxiosError, CreateBillingCycleData>,
  'mutationFn'
>;

export function useCreateBillingCycle(options?: UseCreateBillingCycleOptions) {
  const queryClient = useQueryClient();
  return useMutation<CreateResponse<BillingCycle>, AxiosError, CreateBillingCycleData>({
    ...options,
    mutationFn: createBillingCycle,
    onSuccess: (result, ...args) => {
      queryClient.invalidateQueries({ queryKey: BILLING_CYCLES_QUERY_KEY });
      options?.onSuccess?.(result, ...args);
    },
  });
}
