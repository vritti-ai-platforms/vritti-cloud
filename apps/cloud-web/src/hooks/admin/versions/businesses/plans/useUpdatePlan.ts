import { type UseMutationOptions, useMutation, useQueryClient } from '@tanstack/react-query';
import type { SuccessResponse } from '@vritti/quantum-ui/api-response';
import type { AxiosError } from 'axios';
import type { UpdatePlanData } from '@/schemas/admin/plans';
import { updatePlan } from '@/services/admin/versions/businesses/plans.service';
import { plansQueryKey } from './usePlans';

type UpdatePlanVars = { id: string; data: UpdatePlanData };
type UseUpdatePlanOptions = Omit<UseMutationOptions<SuccessResponse, AxiosError, UpdatePlanVars>, 'mutationFn'>;

// Updates a plan and invalidates the plans list
export function useUpdatePlan(versionId: string, businessId: string, options?: UseUpdatePlanOptions) {
  const queryClient = useQueryClient();
  return useMutation<SuccessResponse, AxiosError, UpdatePlanVars>({
    ...options,
    mutationFn: ({ id, data }) => updatePlan({ versionId, businessId, id, data }),
    onSuccess: (result, ...args) => {
      queryClient.invalidateQueries({ queryKey: plansQueryKey(versionId, businessId) });
      options?.onSuccess?.(result, ...args);
    },
  });
}
