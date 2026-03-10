import { type UseQueryOptions, useQuery } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import type { RegionOption } from '@/services/cloud/infrastructure.service';
import { getRegions } from '@/services/cloud/infrastructure.service';

export const REGIONS_QUERY_KEY = ['cloud', 'regions'] as const;

// Fetches all available regions for org creation
export function useRegions(options?: Omit<UseQueryOptions<RegionOption[], AxiosError>, 'queryKey' | 'queryFn'>) {
  return useQuery<RegionOption[], AxiosError>({
    queryKey: REGIONS_QUERY_KEY,
    queryFn: getRegions,
    ...options,
  });
}
