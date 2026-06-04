import type { SuccessResponse } from '@services/account/profile.service';
import { removePasskey } from '@services/account/security.service';
import type { UseMutationOptions } from '@tanstack/react-query';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import { PASSKEYS_QUERY_KEY } from './useListPasskeys';
import { MFA_STATUS_QUERY_KEY } from './useMfaStatus';

export function useRemovePasskey(
  options?: Omit<UseMutationOptions<SuccessResponse, AxiosError, string>, 'mutationFn'>,
) {
  const queryClient = useQueryClient();

  return useMutation<SuccessResponse, AxiosError, string>({
    mutationFn: removePasskey,
    ...options,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: MFA_STATUS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: PASSKEYS_QUERY_KEY });
      options?.onSuccess?.(...args);
    },
  });
}
