import { type UseMutationOptions, useMutation, useQueryClient } from '@tanstack/react-query';
import type { SuccessResponse } from '@vritti/quantum-ui/types/api-response';
import type { AxiosError } from 'axios';
import { stopDeployment } from '@/services/admin/deployments.service';
import { deploymentQueryKey } from './useDeployment';
import { DEPLOYMENTS_QUERY_KEY } from './useDeployments';

type UseStopDeploymentOptions = Omit<UseMutationOptions<SuccessResponse, AxiosError, string>, 'mutationFn'>;

// Takes a managed deployment offline and refreshes its status (active → stopped).
export function useStopDeployment(options?: UseStopDeploymentOptions) {
  const queryClient = useQueryClient();
  return useMutation<SuccessResponse, AxiosError, string>({
    ...options,
    mutationFn: stopDeployment,
    onSuccess: (result, id, ...args) => {
      queryClient.invalidateQueries({ queryKey: DEPLOYMENTS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: deploymentQueryKey(id) });
      options?.onSuccess?.(result, id, ...args);
    },
  });
}
