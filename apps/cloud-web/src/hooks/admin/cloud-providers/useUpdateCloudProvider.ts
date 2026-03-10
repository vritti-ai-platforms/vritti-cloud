import { type UseMutationOptions, useMutation, useQueryClient } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import type { CloudProviderPayload } from '@/schemas/admin/cloud-providers';
import { updateCloudProvider } from '../../../services/admin/cloud-providers.service';
import { CLOUD_PROVIDERS_QUERY_KEY } from './useCloudProviders';

type Vars = { id: string; data: CloudProviderPayload };
type UseUpdateCloudProviderOptions = Omit<
  UseMutationOptions<{ success: boolean; message: string }, AxiosError, Vars>,
  'mutationFn'
>;

// Updates a cloud provider and invalidates the providers list
export function useUpdateCloudProvider(options?: UseUpdateCloudProviderOptions) {
  const queryClient = useQueryClient();
  return useMutation<{ success: boolean; message: string }, AxiosError, Vars>({
    ...options,
    mutationFn: updateCloudProvider,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: CLOUD_PROVIDERS_QUERY_KEY });
      options?.onSuccess?.(...args);
    },
  });
}
