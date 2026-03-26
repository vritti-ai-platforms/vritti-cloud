import type { UseMutationOptions } from '@tanstack/react-query';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import { deleteAccount } from '@/services/settings.service';

type UseDeleteAccountOptions = Omit<UseMutationOptions<void, AxiosError, void>, 'mutationFn'>;

// Deletes the user account and clears all cached data
export function useDeleteAccount(options?: UseDeleteAccountOptions) {
  const queryClient = useQueryClient();

  return useMutation<void, AxiosError, void>({
    mutationFn: deleteAccount,
    onSuccess: (...args) => {
      queryClient.clear();
      options?.onSuccess?.(...args);
    },
    ...options,
  });
}
