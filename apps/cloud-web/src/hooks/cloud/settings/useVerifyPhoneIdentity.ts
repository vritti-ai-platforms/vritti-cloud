import type { UseMutationOptions } from '@tanstack/react-query';
import { useMutation } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import type { SuccessResponse } from '@services/verification.service';
import { verifyPhoneIdentity } from '@services/verification.service';

type UseVerifyPhoneIdentityOptions = Omit<UseMutationOptions<SuccessResponse, AxiosError, { otpCode: string }>, 'mutationFn'>;

// Verifies identity OTP for phone change
export function useVerifyPhoneIdentity(options?: UseVerifyPhoneIdentityOptions) {
  return useMutation<SuccessResponse, AxiosError, { otpCode: string }>({
    mutationFn: verifyPhoneIdentity,
    ...options,
  });
}
