import { type UseMutationOptions, useMutation, useQueryClient } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import { removeCloudProvider } from '../../../services/admin/regions.service';

interface RemoveCloudProviderVariables {
  regionId: string;
  providerId: string;
}

type UseRemoveCloudProviderOptions = Omit<
  UseMutationOptions<void, AxiosError, RemoveCloudProviderVariables>,
  'mutationFn'
>;

// Removes a cloud provider from a region and invalidates the region detail query
export function useRemoveCloudProvider(options?: UseRemoveCloudProviderOptions) {
  const queryClient = useQueryClient();
  return useMutation<void, AxiosError, RemoveCloudProviderVariables>({
    mutationFn: ({ regionId, providerId }) => removeCloudProvider(regionId, providerId),
    ...options,
    onSuccess: (data, variables, ...args) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'regions', variables.regionId] });
      options?.onSuccess?.(data, variables, ...args);
    },
  });
}
