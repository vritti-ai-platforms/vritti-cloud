import { changeEmail, type SendEmailOtpResponse } from '@services/onboarding.service';
import { type UseMutationOptions, useMutation } from '@tanstack/react-query';
import type { AxiosError } from 'axios';

type UseChangeEmailOptions = Omit<UseMutationOptions<SendEmailOtpResponse, AxiosError, string>, 'mutationFn'>;

export function useChangeEmail(options?: UseChangeEmailOptions) {
  return useMutation<SendEmailOtpResponse, AxiosError, string>({
    mutationFn: changeEmail,
    ...options,
  });
}
