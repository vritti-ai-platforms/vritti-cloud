import type { UseMutationOptions } from '@tanstack/react-query';
import { useMutation } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import type { SuccessResponse } from '@/services/account/verification.service';
import { resendEmailOtp } from '@/services/account/verification.service';

type UseResendEmailOtpOptions = Omit<UseMutationOptions<SuccessResponse, AxiosError, void>, 'mutationFn'>;

// Resends OTP for email verification
export function useResendEmailOtp(options?: UseResendEmailOtpOptions) {
  return useMutation<SuccessResponse, AxiosError, void>({
    mutationFn: resendEmailOtp,
    ...options,
  });
}
