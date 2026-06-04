import type { OnboardingStatusResponse } from '@services/onboarding.service';
import { getStatus } from '@services/onboarding.service';
import { type UseQueryResult, useQuery } from '@tanstack/react-query';

const ONBOARDING_STATUS_KEY = ['onboarding', 'status'] as const;

// Fetches the current onboarding status for the authenticated user
export function useOnboardingStatus(): UseQueryResult<OnboardingStatusResponse> {
  return useQuery({
    queryKey: ONBOARDING_STATUS_KEY,
    queryFn: getStatus,
    staleTime: 5 * 60 * 1000,
    retry: false,
    throwOnError: false,
  });
}
