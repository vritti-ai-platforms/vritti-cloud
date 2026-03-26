import type { UseMutationOptions } from '@tanstack/react-query';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import type { SuccessResponse } from '@services/verification.service';
import { verifyPhoneChange } from '@services/verification.service';
import { PROFILE_QUERY_KEY } from './useProfile';

type UseVerifyPhoneChangeOptions = Omit<UseMutationOptions<SuccessResponse, AxiosError, { otpCode: string }>, 'mutationFn'>;

// Verifies OTP sent to the new phone and invalidates profile
export function useVerifyPhoneChange(options?: UseVerifyPhoneChangeOptions) {
  const queryClient = useQueryClient();
  return useMutation<SuccessResponse, AxiosError, { otpCode: string }>({
    mutationFn: verifyPhoneChange,
    onSuccess: (result, ...args) => {
      queryClient.invalidateQueries({ queryKey: PROFILE_QUERY_KEY });
      options?.onSuccess?.(result, ...args);
    },
    ...options,
  });
}
