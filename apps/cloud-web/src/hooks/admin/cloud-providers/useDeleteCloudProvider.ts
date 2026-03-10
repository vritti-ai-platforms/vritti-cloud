import { type UseMutationOptions, useMutation, useQueryClient } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import { deleteCloudProvider } from '../../../services/admin/cloud-providers.service';
import { CLOUD_PROVIDERS_QUERY_KEY } from './useCloudProviders';

type UseDeleteCloudProviderOptions = Omit<UseMutationOptions<void, AxiosError, string>, 'mutationFn'>;

// Deletes a cloud provider and invalidates the providers list
export function useDeleteCloudProvider(options?: UseDeleteCloudProviderOptions) {
  const queryClient = useQueryClient();
  return useMutation<void, AxiosError, string>({
    ...options,
    mutationFn: deleteCloudProvider,
    ...options,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: CLOUD_PROVIDERS_QUERY_KEY });
      options?.onSuccess?.(...args);
    },
  });
}
