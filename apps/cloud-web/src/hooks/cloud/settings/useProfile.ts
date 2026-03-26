import type { UseQueryOptions } from '@tanstack/react-query';
import { useQuery } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import type { ProfileData } from '@/schemas/cloud/settings';
import { getProfile } from '@/services/settings.service';

export const PROFILE_QUERY_KEY = ['profile'] as const;

// Fetches the current user profile
export function useProfile(options?: Omit<UseQueryOptions<ProfileData, AxiosError>, 'queryKey' | 'queryFn'>) {
  return useQuery<ProfileData, AxiosError>({
    queryKey: PROFILE_QUERY_KEY,
    queryFn: getProfile,
    ...options,
  });
}
