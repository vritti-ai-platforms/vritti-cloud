import { type OnboardingStatusResponse, verifyEmail } from '@services/onboarding.service';
import { type UseMutationOptions, useMutation } from '@tanstack/react-query';
import type { AxiosError } from 'axios';

type UseVerifyEmailOptions = Omit<UseMutationOptions<OnboardingStatusResponse, AxiosError, string>, 'mutationFn'>;

export function useVerifyEmail(options?: UseVerifyEmailOptions) {
  return useMutation<OnboardingStatusResponse, AxiosError, string>({
    mutationFn: verifyEmail,
    ...options,
  });
}
