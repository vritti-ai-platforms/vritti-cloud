import { type UseMutationOptions, useMutation, useQueryClient } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import type { MutationResponse } from '@vritti/quantum-ui/api-response';
import type { UpdatePlanData } from '@/schemas/admin/plans';
import { updatePlan } from '../../../services/admin/plans.service';
import { PLANS_QUERY_KEY } from './usePlans';
type UpdatePlanVars = { id: string; data: UpdatePlanData };
type UseUpdatePlanOptions = Omit<UseMutationOptions<MutationResponse, AxiosError, UpdatePlanVars>, 'mutationFn'>;

// Updates a plan and invalidates the plans list
export function useUpdatePlan(options?: UseUpdatePlanOptions) {
  const queryClient = useQueryClient();
  return useMutation<MutationResponse, AxiosError, UpdatePlanVars>({
    ...options,
    mutationFn: updatePlan,
    onSuccess: (result, ...args) => {
      queryClient.invalidateQueries({ queryKey: PLANS_QUERY_KEY });
      options?.onSuccess?.(result, ...args);
    },
  });
}
