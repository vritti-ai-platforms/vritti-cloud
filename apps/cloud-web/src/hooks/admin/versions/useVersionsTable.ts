import { type UseQueryOptions, useQuery } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import type { VersionsTableResponse } from '@/schemas/admin/versions';
import { getVersionsTable } from '../../../services/admin/versions.service';

export const VERSIONS_TABLE_KEY = ['admin', 'versions', 'table'] as const;

// Fetches all versions — server applies filter/sort state
export function useVersionsTable(
  options?: Omit<UseQueryOptions<VersionsTableResponse, AxiosError>, 'queryKey' | 'queryFn'>,
) {
  return useQuery<VersionsTableResponse, AxiosError>({
    queryKey: VERSIONS_TABLE_KEY,
    queryFn: getVersionsTable,
    ...options,
  });
}
