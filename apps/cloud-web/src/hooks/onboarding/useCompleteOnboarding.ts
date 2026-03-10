import { type CompleteOnboardingResponse, completeOnboarding } from '@services/onboarding.service';
import { type UseMutationOptions, useMutation } from '@tanstack/react-query';
import type { AxiosError } from 'axios';

type UseCompleteOnboardingOptions = Omit<
  UseMutationOptions<CompleteOnboardingResponse, AxiosError, void>,
  'mutationFn'
>;

// Upgrades ONBOARDING session to CLOUD and rotates tokens
export function useCompleteOnboarding(options?: UseCompleteOnboardingOptions) {
  return useMutation<CompleteOnboardingResponse, AxiosError, void>({
    mutationFn: completeOnboarding,
    ...options,
  });
}
