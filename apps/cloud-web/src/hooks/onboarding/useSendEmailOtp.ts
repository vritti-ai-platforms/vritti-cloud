import { type SendEmailOtpResponse, sendEmailOtp } from '@services/onboarding.service';
import { type UseMutationOptions, useMutation } from '@tanstack/react-query';
import type { AxiosError } from 'axios';

type UseSendEmailOtpOptions = Omit<UseMutationOptions<SendEmailOtpResponse, AxiosError, void>, 'mutationFn'>;

export function useSendEmailOtp(options?: UseSendEmailOtpOptions) {
  return useMutation<SendEmailOtpResponse, AxiosError, void>({
    mutationFn: sendEmailOtp,
    ...options,
  });
}
