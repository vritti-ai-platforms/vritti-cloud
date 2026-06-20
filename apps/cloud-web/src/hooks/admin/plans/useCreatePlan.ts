import { type UseMutationOptions, useMutation, useQueryClient } from '@tanstack/react-query';
import type { CreateResponse } from '@vritti/quantum-ui/api-response';
import type { AxiosError } from 'axios';
import type { CreatePlanData, Plan } from '@/schemas/admin/plans';
import { createPlan } from '@/services/admin/plans.service';
import { plansQueryKey } from './usePlans';

type UseCreatePlanOptions = Omit<UseMutationOptions<CreateResponse<Plan>, AxiosError, CreatePlanData>, 'mutationFn'>;

// Creates a new plan under the version + business and invalidates the plans list
export function useCreatePlan(versionId: string, businessId: string, options?: UseCreatePlanOptions) {
  const queryClient = useQueryClient();
  return useMutation<CreateResponse<Plan>, AxiosError, CreatePlanData>({
    ...options,
    mutationFn: (data) => createPlan({ versionId, businessId, data }),
    onSuccess: (result, ...args) => {
      queryClient.invalidateQueries({ queryKey: plansQueryKey(versionId, businessId) });
      options?.onSuccess?.(result, ...args);
    },
  });
}
