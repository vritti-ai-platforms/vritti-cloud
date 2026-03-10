import { type UseMutationOptions, useMutation, useQueryClient } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import { deletePlan } from '../../../services/admin/plans.service';
import { PLANS_QUERY_KEY } from './usePlans';

type UseDeletePlanOptions = Omit<UseMutationOptions<void, AxiosError, string>, 'mutationFn'>;

// Deletes a plan and invalidates the plans list
export function useDeletePlan(options?: UseDeletePlanOptions) {
  const queryClient = useQueryClient();
  return useMutation<void, AxiosError, string>({
    ...options,
    mutationFn: deletePlan,
    onSuccess: (result, ...args) => {
      queryClient.invalidateQueries({ queryKey: PLANS_QUERY_KEY });
      options?.onSuccess?.(result, ...args);
    },
  });
}
