import type { UseMutationOptions } from '@tanstack/react-query';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import type { SuccessResponse } from '@services/account/profile.service';
import { disableTotp } from '@services/account/security.service';
import { MFA_STATUS_QUERY_KEY } from './useMfaStatus';

export function useDisableTotp(
  options?: Omit<UseMutationOptions<SuccessResponse, AxiosError, void>, 'mutationFn'>,
) {
  const queryClient = useQueryClient();

  return useMutation<SuccessResponse, AxiosError, void>({
    mutationFn: disableTotp,
    ...options,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: MFA_STATUS_QUERY_KEY });
      options?.onSuccess?.(...args);
    },
  });
}
