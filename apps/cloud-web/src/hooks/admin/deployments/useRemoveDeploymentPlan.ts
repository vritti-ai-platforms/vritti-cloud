import { type UseMutationOptions, useMutation, useQueryClient } from '@tanstack/react-query';
import type { SuccessResponse } from '@vritti/quantum-ui/api-response';
import type { AxiosError } from 'axios';
import type { AssignPlanData } from '@/schemas/admin/deployments';
import { removeDeploymentPlan } from '@/services/admin/deployments.service';
import { DEPLOYMENT_PLAN_ASSIGNMENTS_QUERY_KEY } from './useDeploymentPlanAssignments';

type Vars = { id: string; data: AssignPlanData };
type UseRemoveOptions = Omit<UseMutationOptions<SuccessResponse, AxiosError, Vars>, 'mutationFn'>;

// Removes a plan+business assignment from a deployment
export function useRemoveDeploymentPlan(options?: UseRemoveOptions) {
  const queryClient = useQueryClient();
  return useMutation<SuccessResponse, AxiosError, Vars>({
    ...options,
    mutationFn: removeDeploymentPlan,
    onSuccess: (result, vars, ...args) => {
      queryClient.invalidateQueries({ queryKey: DEPLOYMENT_PLAN_ASSIGNMENTS_QUERY_KEY(vars.id) });
      options?.onSuccess?.(result, vars, ...args);
    },
  });
}
