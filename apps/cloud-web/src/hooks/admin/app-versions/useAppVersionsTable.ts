import { type UseQueryOptions, useQuery } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import type { AppVersionsTableResponse } from '@/schemas/admin/app-versions';
import { getAppVersionsTable } from '../../../services/admin/app-versions.service';

export const APP_VERSIONS_TABLE_KEY = ['admin', 'app-versions', 'table'] as const;

// Fetches all app versions — server applies filter/sort state
export function useAppVersionsTable(
  options?: Omit<UseQueryOptions<AppVersionsTableResponse, AxiosError>, 'queryKey' | 'queryFn'>,
) {
  return useQuery<AppVersionsTableResponse, AxiosError>({
    queryKey: APP_VERSIONS_TABLE_KEY,
    queryFn: getAppVersionsTable,
    ...options,
  });
}
