import { type UseQueryOptions, useQuery } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import type { IndustriesResponse } from '@/schemas/admin/industries';
import { getIndustries } from '../../../services/admin/industries.service';

export const INDUSTRIES_QUERY_KEY = ['admin', 'industries'] as const;

// Fetches all industries — server applies filter/sort state
export function useIndustries(options?: Omit<UseQueryOptions<IndustriesResponse, AxiosError>, 'queryKey' | 'queryFn'>) {
  return useQuery<IndustriesResponse, AxiosError>({
    queryKey: INDUSTRIES_QUERY_KEY,
    queryFn: getIndustries,
    ...options,
  });
}
