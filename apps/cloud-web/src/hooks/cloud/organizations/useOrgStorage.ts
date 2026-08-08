import { type UseQueryOptions, useQuery } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import { getOrgStorageUsage, type OrgStorageUsage } from '@/services/cloud/org-storage.service';

const ORG_STORAGE_QUERY_KEY = (orgId: string) => ['organizations', orgId, 'storage'] as const;

type UseOrgStorageOptions = Omit<UseQueryOptions<OrgStorageUsage, AxiosError>, 'queryKey' | 'queryFn'>;

// Every call reaches Cloudflare, so this is deliberately not refetched on window focus — the figure moves slowly and
// the provider's own reporting lags by minutes anyway, which no amount of polling would fix.
export function useOrgStorage(orgId: string, options?: UseOrgStorageOptions) {
  return useQuery<OrgStorageUsage, AxiosError>({
    queryKey: ORG_STORAGE_QUERY_KEY(orgId),
    queryFn: () => getOrgStorageUsage(orgId),
    enabled: !!orgId,
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000,
    ...options,
  });
}
