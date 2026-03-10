import { type UseMutationOptions, useMutation, useQueryClient } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import { deleteDeployment } from '@/services/admin/deployments.service';
import { DEPLOYMENTS_QUERY_KEY } from './useDeployments';

type UseDeleteDeploymentOptions = Omit<UseMutationOptions<void, AxiosError, string>, 'mutationFn'>;

// Deletes a deployment and invalidates the deployments list
export function useDeleteDeployment(options?: UseDeleteDeploymentOptions) {
  const queryClient = useQueryClient();
  return useMutation<void, AxiosError, string>({
    ...options,
    mutationFn: deleteDeployment,
    onSuccess: (result, ...args) => {
      queryClient.invalidateQueries({ queryKey: DEPLOYMENTS_QUERY_KEY });
      options?.onSuccess?.(result, ...args);
    },
  });
}
