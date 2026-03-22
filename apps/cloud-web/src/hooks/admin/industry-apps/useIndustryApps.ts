import { type UseQueryOptions, useQuery } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import type { IndustryApp } from '@/schemas/admin/industry-apps';
import { getIndustryApps } from '../../../services/admin/industry-apps.service';

export function industryAppsQueryKey(industryId: string) {
  return ['admin', 'industries', industryId, 'apps'] as const;
}

// Fetches apps assigned to an industry
export function useIndustryApps(
  industryId: string,
  options?: Omit<UseQueryOptions<IndustryApp[], AxiosError>, 'queryKey' | 'queryFn'>,
) {
  return useQuery<IndustryApp[], AxiosError>({
    queryKey: industryAppsQueryKey(industryId),
    queryFn: () => getIndustryApps(industryId),
    enabled: !!industryId,
    ...options,
  });
}
