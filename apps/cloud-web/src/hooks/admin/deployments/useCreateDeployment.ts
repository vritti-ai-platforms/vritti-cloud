import { type UseMutationOptions, useMutation, useQueryClient } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import type { CreateDeploymentData, Deployment } from '@/schemas/admin/deployments';
import { createDeployment } from '@/services/admin/deployments.service';
import { DEPLOYMENTS_QUERY_KEY } from './useDeployments';

type UseCreateDeploymentOptions = Omit<UseMutationOptions<Deployment, AxiosError, CreateDeploymentData>, 'mutationFn'>;

// Creates a new deployment and invalidates the deployments list
export function useCreateDeployment(options?: UseCreateDeploymentOptions) {
  const queryClient = useQueryClient();
  return useMutation<Deployment, AxiosError, CreateDeploymentData>({
    ...options,
    mutationFn: createDeployment,
    onSuccess: (result, ...args) => {
      queryClient.invalidateQueries({ queryKey: DEPLOYMENTS_QUERY_KEY });
      options?.onSuccess?.(result, ...args);
    },
  });
}
