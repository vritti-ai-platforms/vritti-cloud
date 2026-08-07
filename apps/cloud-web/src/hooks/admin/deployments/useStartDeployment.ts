import { type UseMutationOptions, useMutation, useQueryClient } from '@tanstack/react-query';
import type { SuccessResponse } from '@vritti/quantum-ui/types/api-response';
import type { AxiosError } from 'axios';
import { startDeployment } from '@/services/admin/deployments.service';
import { deploymentQueryKey } from './useDeployment';
import { DEPLOYMENTS_QUERY_KEY } from './useDeployments';

type UseStartDeploymentOptions = Omit<UseMutationOptions<SuccessResponse, AxiosError, string>, 'mutationFn'>;

// Brings a stopped managed deployment back online and refreshes its status (stopped → active).
export function useStartDeployment(options?: UseStartDeploymentOptions) {
  const queryClient = useQueryClient();
  return useMutation<SuccessResponse, AxiosError, string>({
    ...options,
    mutationFn: startDeployment,
    onSuccess: (result, id, ...args) => {
      queryClient.invalidateQueries({ queryKey: DEPLOYMENTS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: deploymentQueryKey(id) });
      options?.onSuccess?.(result, id, ...args);
    },
  });
}
