import { type UseMutationOptions, useMutation, useQueryClient } from '@tanstack/react-query';
import type { SuccessResponse } from '@vritti/quantum-ui/types/api-response';
import type { AxiosError } from 'axios';
import type { UpdateBillingCycleData } from '@/schemas/admin/billing-cycles';
import { updateBillingCycle } from '@/services/admin/billing-cycles.service';
import { BILLING_CYCLES_QUERY_KEY } from './useBillingCycles';

type Vars = { id: string; data: UpdateBillingCycleData };
type UseUpdateBillingCycleOptions = Omit<UseMutationOptions<SuccessResponse, AxiosError, Vars>, 'mutationFn'>;

export function useUpdateBillingCycle(options?: UseUpdateBillingCycleOptions) {
  const queryClient = useQueryClient();
  return useMutation<SuccessResponse, AxiosError, Vars>({
    ...options,
    mutationFn: updateBillingCycle,
    onSuccess: (result, ...args) => {
      queryClient.invalidateQueries({ queryKey: BILLING_CYCLES_QUERY_KEY });
      options?.onSuccess?.(result, ...args);
    },
  });
}
