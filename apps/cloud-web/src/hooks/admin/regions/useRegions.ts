import { type UseQueryOptions, useQuery } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import type { RegionsResponse } from '@/schemas/admin/regions';
import { getRegions } from '../../../services/admin/regions.service';

export const REGIONS_QUERY_KEY = ['admin', 'regions'] as const;

// Fetches all regions — server applies filter/sort state
export function useRegions(options?: Omit<UseQueryOptions<RegionsResponse, AxiosError>, 'queryKey' | 'queryFn'>) {
  return useQuery<RegionsResponse, AxiosError>({
    queryKey: REGIONS_QUERY_KEY,
    queryFn: getRegions,
    ...options,
  });
}
