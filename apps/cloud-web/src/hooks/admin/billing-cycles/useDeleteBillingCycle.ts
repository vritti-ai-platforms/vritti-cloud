import { type UseMutationOptions, useMutation, useQueryClient } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import { deleteBillingCycle } from '@/services/admin/billing-cycles.service';
import { BILLING_CYCLES_QUERY_KEY } from './useBillingCycles';

type UseDeleteBillingCycleOptions = Omit<UseMutationOptions<void, AxiosError, string>, 'mutationFn'>;

export function useDeleteBillingCycle(options?: UseDeleteBillingCycleOptions) {
  const queryClient = useQueryClient();
  return useMutation<void, AxiosError, string>({
    ...options,
    mutationFn: deleteBillingCycle,
    onSuccess: (result, ...args) => {
      queryClient.invalidateQueries({ queryKey: BILLING_CYCLES_QUERY_KEY });
      options?.onSuccess?.(result, ...args);
    },
  });
}
