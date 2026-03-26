import type { UseMutationOptions } from '@tanstack/react-query';
import { useMutation } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import type { SuccessResponse } from '@/services/account/verification.service';
import { resendPhoneOtp } from '@/services/account/verification.service';

type UseResendPhoneOtpOptions = Omit<UseMutationOptions<SuccessResponse, AxiosError, void>, 'mutationFn'>;

// Resends OTP for phone verification
export function useResendPhoneOtp(options?: UseResendPhoneOtpOptions) {
  return useMutation<SuccessResponse, AxiosError, void>({
    mutationFn: resendPhoneOtp,
    ...options,
  });
}
