import { type UseQueryOptions, useQuery } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import type { VersionBusiness } from '@/schemas/admin/version-businesses';
import { getVersionBusinesses } from '@/services/admin/versions/businesses.service';

export const VERSION_BUSINESSES_QUERY_KEY = (versionId: string) =>
  ['admin', 'versions', versionId, 'businesses'] as const;

// Fetches businesses for a version with per-business app counts
export function useVersionBusinesses(
  versionId: string,
  options?: Omit<UseQueryOptions<VersionBusiness[], AxiosError>, 'queryKey' | 'queryFn'>,
) {
  return useQuery<VersionBusiness[], AxiosError>({
    queryKey: VERSION_BUSINESSES_QUERY_KEY(versionId),
    queryFn: () => getVersionBusinesses(versionId),
    ...options,
  });
}
