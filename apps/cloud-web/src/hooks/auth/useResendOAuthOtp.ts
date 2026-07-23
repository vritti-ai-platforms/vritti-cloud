import { resendOAuthOtp, type SuccessResponse } from '@services/auth.service';
import { type UseMutationOptions, useMutation } from '@tanstack/react-query';
import type { AxiosError } from 'axios';

type UseResendOAuthOtpOptions = Omit<UseMutationOptions<SuccessResponse, AxiosError, void>, 'mutationFn'>;

export function useResendOAuthOtp(options?: UseResendOAuthOtpOptions) {
  return useMutation<SuccessResponse, AxiosError, void>({
    mutationFn: resendOAuthOtp,
    ...options,
  });
}
