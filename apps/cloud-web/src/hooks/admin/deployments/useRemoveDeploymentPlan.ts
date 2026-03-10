import { type UseMutationOptions, useMutation, useQueryClient } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import type { AssignPlanData } from '@/schemas/admin/deployments';
import { removeDeploymentPlan } from '@/services/admin/deployments.service';
import { deploymentPlanPricesQueryKey } from './useDeploymentPlanPrices';
import { deploymentPlansQueryKey } from './useDeploymentPlans';

type Vars = { id: string; data: AssignPlanData };
type UseRemoveOptions = Omit<UseMutationOptions<void, AxiosError, Vars>, 'mutationFn'>;

// Removes a plan+industry assignment from a deployment
export function useRemoveDeploymentPlan(options?: UseRemoveOptions) {
  const queryClient = useQueryClient();
  return useMutation<void, AxiosError, Vars>({
    ...options,
    mutationFn: removeDeploymentPlan,
    onSuccess: (result, vars, ...args) => {
      queryClient.invalidateQueries({ queryKey: deploymentPlansQueryKey(vars.id) });
      queryClient.invalidateQueries({ queryKey: deploymentPlanPricesQueryKey(vars.id) });
      options?.onSuccess?.(result, vars, ...args);
    },
  });
}
