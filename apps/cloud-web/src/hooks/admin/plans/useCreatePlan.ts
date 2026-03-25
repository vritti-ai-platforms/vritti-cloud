import { type UseMutationOptions, useMutation, useQueryClient } from '@tanstack/react-query';
import type { CreateResponse } from '@vritti/quantum-ui/api-response';
import type { AxiosError } from 'axios';
import type { CreatePlanData, Plan } from '@/schemas/admin/plans';
import { createPlan } from '../../../services/admin/plans.service';
import { PLANS_QUERY_KEY } from './usePlans';

type UseCreatePlanOptions = Omit<UseMutationOptions<CreateResponse<Plan>, AxiosError, CreatePlanData>, 'mutationFn'>;

// Creates a new plan and invalidates the plans list
export function useCreatePlan(options?: UseCreatePlanOptions) {
  const queryClient = useQueryClient();
  return useMutation<CreateResponse<Plan>, AxiosError, CreatePlanData>({
    ...options,
    mutationFn: createPlan,
    onSuccess: (result, ...args) => {
      queryClient.invalidateQueries({ queryKey: PLANS_QUERY_KEY });
      options?.onSuccess?.(result, ...args);
    },
  });
}
