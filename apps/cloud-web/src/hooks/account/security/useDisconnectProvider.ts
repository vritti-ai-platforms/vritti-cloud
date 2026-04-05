import { disconnectProvider } from '@services/account/security.service';
import type { SuccessResponse } from '@services/account/profile.service';
import type { UseMutationOptions } from '@tanstack/react-query';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import { LINKED_ACCOUNTS_QUERY_KEY } from './useLinkedAccounts';

export function useDisconnectProvider(
  options?: Omit<UseMutationOptions<SuccessResponse, AxiosError, string>, 'mutationFn'>,
) {
  const queryClient = useQueryClient();

  return useMutation<SuccessResponse, AxiosError, string>({
    mutationFn: disconnectProvider,
    ...options,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: LINKED_ACCOUNTS_QUERY_KEY });
      options?.onSuccess?.(...args);
    },
  });
}
