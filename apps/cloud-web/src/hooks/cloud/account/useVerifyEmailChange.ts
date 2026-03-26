import type { UseMutationOptions } from '@tanstack/react-query';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import type { SuccessResponse } from '@/services/account/verification.service';
import { verifyEmailChange } from '@/services/account/verification.service';
import { PROFILE_QUERY_KEY } from './useProfile';

type UseVerifyEmailChangeOptions = Omit<
  UseMutationOptions<SuccessResponse, AxiosError, { otpCode: string }>,
  'mutationFn'
>;

// Verifies OTP sent to the new email and invalidates profile
export function useVerifyEmailChange(options?: UseVerifyEmailChangeOptions) {
  const queryClient = useQueryClient();
  return useMutation<SuccessResponse, AxiosError, { otpCode: string }>({
    ...options,
    mutationFn: verifyEmailChange,
    onSuccess: (result, ...args) => {
      queryClient.invalidateQueries({ queryKey: PROFILE_QUERY_KEY });
      options?.onSuccess?.(result, ...args);
    },
  });
}
