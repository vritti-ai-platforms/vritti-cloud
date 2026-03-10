import { type UseMutationOptions, useMutation, useQueryClient } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import type { MutationResponse } from '@vritti/quantum-ui/api-response';
import type { UpdateDeploymentData } from '@/schemas/admin/deployments';
import { updateDeployment } from '@/services/admin/deployments.service';
import { deploymentQueryKey } from './useDeployment';
import { DEPLOYMENTS_QUERY_KEY } from './useDeployments';
type UpdateDeploymentVars = { id: string; data: UpdateDeploymentData };
type UseUpdateDeploymentOptions = Omit<UseMutationOptions<MutationResponse, AxiosError, UpdateDeploymentVars>, 'mutationFn'>;

// Updates a deployment and invalidates relevant queries
export function useUpdateDeployment(options?: UseUpdateDeploymentOptions) {
  const queryClient = useQueryClient();
  return useMutation<MutationResponse, AxiosError, UpdateDeploymentVars>({
    ...options,
    mutationFn: updateDeployment,
    onSuccess: (result, vars, ...args) => {
      queryClient.invalidateQueries({ queryKey: DEPLOYMENTS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: deploymentQueryKey(vars.id) });
      options?.onSuccess?.(result, vars, ...args);
    },
  });
}
