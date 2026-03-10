import type { OnboardingStatusResponse } from '@services/onboarding.service';
import { getStatus } from '@services/onboarding.service';
import { useQuery } from '@tanstack/react-query';
import type React from 'react';
import { createContext, useContext, useEffect, useState } from 'react';

export interface OnboardingContextType extends OnboardingStatusResponse {
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  progress: number;
  setProgress: (value: number) => void;
}

const ONBOARDING_STATUS_KEY = ['onboarding', 'status'] as const;

const emptyState: Omit<OnboardingContextType, 'refetch' | 'progress' | 'setProgress'> = {
  email: '',
  currentStep: '',
  onboardingComplete: false,
  signupMethod: 'email',
  isLoading: false,
  error: null,
};

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

// Accesses onboarding state — must be used within OnboardingProvider
export function useOnboarding(): OnboardingContextType {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
}

// Fetches onboarding status and provides it via context
export const OnboardingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ONBOARDING_STATUS_KEY,
    queryFn: getStatus,
    staleTime: 5 * 60 * 1000,
    retry: false,
    throwOnError: false,
  });

  const [progress, setProgress] = useState(0);

  // Reset progress to 0 whenever the backend step advances
  useEffect(() => {
    setProgress(0);
  }, [data?.currentStep]);

  const contextValue: OnboardingContextType = {
    ...(data ?? emptyState),
    isLoading,
    error: error?.message ?? null,
    refetch: async () => {
      await refetch();
    },
    progress,
    setProgress,
  };

  return <OnboardingContext.Provider value={contextValue}>{children}</OnboardingContext.Provider>;
};
