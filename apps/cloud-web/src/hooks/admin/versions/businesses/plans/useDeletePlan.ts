import { type UseMutationOptions, useMutation, useQueryClient } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import { deletePlan } from '@/services/admin/versions/businesses/plans.service';
import { plansQueryKey } from './usePlans';

type UseDeletePlanOptions = Omit<UseMutationOptions<void, AxiosError, string>, 'mutationFn'>;

// Deletes a plan and invalidates the plans list
export function useDeletePlan(versionId: string, businessId: string, options?: UseDeletePlanOptions) {
  const queryClient = useQueryClient();
  return useMutation<void, AxiosError, string>({
    ...options,
    mutationFn: (id) => deletePlan({ versionId, businessId, id }),
    onSuccess: (result, ...args) => {
      queryClient.invalidateQueries({ queryKey: plansQueryKey(versionId, businessId) });
      options?.onSuccess?.(result, ...args);
    },
  });
}
