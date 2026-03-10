import { type UseMutationOptions, useMutation } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import { type SuccessResponse, verifyResetOtp } from '../../services/auth.service';

type UseVerifyResetOtpOptions = Omit<UseMutationOptions<SuccessResponse, AxiosError, string>, 'mutationFn'>;

// Verifies the password reset OTP using RESET session Bearer token
export function useVerifyResetOtp(options?: UseVerifyResetOtpOptions) {
  return useMutation<SuccessResponse, AxiosError, string>({
    mutationFn: verifyResetOtp,
    ...options,
  });
}
