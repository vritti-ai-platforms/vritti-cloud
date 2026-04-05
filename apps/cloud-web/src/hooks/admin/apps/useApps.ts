import { type UseQueryOptions, useQuery } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import type { AppsTableResponse } from '@/schemas/admin/apps';
import { getApps } from '../../../services/admin/apps.service';

export const APPS_QUERY_KEY = (versionId: string) => ['admin', 'versions', versionId, 'apps'] as const;

// Fetches all apps — server applies filter/sort state
export function useApps(
  versionId: string,
  options?: Omit<UseQueryOptions<AppsTableResponse, AxiosError>, 'queryKey' | 'queryFn'>,
) {
  return useQuery<AppsTableResponse, AxiosError>({
    queryKey: APPS_QUERY_KEY(versionId),
    queryFn: () => getApps(versionId),
    ...options,
  });
}
