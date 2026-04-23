import { type UseMutationOptions, useMutation, useQueryClient } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import type { SuccessResponse } from '@vritti/quantum-ui/api-response';
import type { AssignPlanData } from '@/schemas/admin/deployments';
import { assignDeploymentPlan } from '@/services/admin/deployments.service';
import { DEPLOYMENT_PLAN_ASSIGNMENTS_QUERY_KEY } from './useDeploymentPlanAssignments';

type Vars = { id: string; data: AssignPlanData };
type UseAssignOptions = Omit<UseMutationOptions<SuccessResponse, AxiosError, Vars>, 'mutationFn'>;

// Assigns a plan+industry to a deployment and invalidates its plan assignments
export function useAssignDeploymentPlan(options?: UseAssignOptions) {
  const queryClient = useQueryClient();
  return useMutation<SuccessResponse, AxiosError, Vars>({
    ...options,
    mutationFn: assignDeploymentPlan,
    onSuccess: (result, vars, ...args) => {
      queryClient.invalidateQueries({ queryKey: DEPLOYMENT_PLAN_ASSIGNMENTS_QUERY_KEY(vars.id) });
      options?.onSuccess?.(result, vars, ...args);
    },
  });
}
