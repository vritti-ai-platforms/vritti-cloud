import type { UseMutationOptions } from '@tanstack/react-query';
import { useMutation } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import type { SuccessResponse } from '@/services/settings/verification.service';
import { verifyEmailIdentity } from '@/services/settings/verification.service';

type UseVerifyEmailIdentityOptions = Omit<
  UseMutationOptions<SuccessResponse, AxiosError, { otpCode: string }>,
  'mutationFn'
>;

// Verifies identity OTP for email change
export function useVerifyEmailIdentity(options?: UseVerifyEmailIdentityOptions) {
  return useMutation<SuccessResponse, AxiosError, { otpCode: string }>({
    mutationFn: verifyEmailIdentity,
    ...options,
  });
}
