import { type UseQueryOptions, useQuery } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import type { AppsTableResponse } from '@/schemas/admin/apps';
import { getApps } from '@/services/admin/versions/businesses/apps.service';

export const APPS_QUERY_KEY = (versionId: string, businessId: string) =>
  ['admin', 'versions', versionId, 'businesses', businessId, 'apps'] as const;

// Fetches apps for a business — server applies filter/sort state
export function useApps(
  versionId: string,
  businessId: string,
  options?: Omit<UseQueryOptions<AppsTableResponse, AxiosError>, 'queryKey' | 'queryFn'>,
) {
  return useQuery<AppsTableResponse, AxiosError>({
    queryKey: APPS_QUERY_KEY(versionId, businessId),
    queryFn: () => getApps(versionId, businessId),
    enabled: !!businessId,
    ...options,
  });
}
