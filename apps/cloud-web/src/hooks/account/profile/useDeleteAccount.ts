import type { UseMutationOptions } from '@tanstack/react-query';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import { deleteAccount } from '@/services/account/profile.service';

type UseDeleteAccountOptions = Omit<UseMutationOptions<void, AxiosError, void>, 'mutationFn'>;

export function useDeleteAccount(options?: UseDeleteAccountOptions) {
  const queryClient = useQueryClient();

  return useMutation<void, AxiosError, void>({
    ...options,
    mutationFn: deleteAccount,
    onSuccess: (...args) => {
      queryClient.clear();
      options?.onSuccess?.(...args);
    },
  });
}
