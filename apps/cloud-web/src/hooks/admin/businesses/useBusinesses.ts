import { type UseQueryOptions, useQuery } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import type { BusinessesResponse } from '@/schemas/admin/businesses';
import { getBusinesses } from '@/services/admin/businesses.service';

export const BUSINESSES_QUERY_KEY = ['admin', 'businesses'] as const;

// Fetches all businesses — server applies filter/sort state
export function useBusinesses(options?: Omit<UseQueryOptions<BusinessesResponse, AxiosError>, 'queryKey' | 'queryFn'>) {
  return useQuery<BusinessesResponse, AxiosError>({
    queryKey: BUSINESSES_QUERY_KEY,
    queryFn: getBusinesses,
    ...options,
  });
}
