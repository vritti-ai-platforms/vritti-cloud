import { type UseQueryOptions, useQuery } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import type { Version } from '@/schemas/admin/versions';
import { getVersion } from '../../../services/admin/versions.service';

export function versionQueryKey(id: string) {
  return ['admin', 'versions', id] as const;
}

// Fetches a single version by ID
export function useVersion(
  id: string,
  options?: Omit<UseQueryOptions<Version, AxiosError>, 'queryKey' | 'queryFn'>,
) {
  return useQuery<Version, AxiosError>({
    queryKey: versionQueryKey(id),
    queryFn: () => getVersion(id),
    enabled: !!id,
    ...options,
  });
}
