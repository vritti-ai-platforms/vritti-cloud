import { type UseQueryOptions, useQuery } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import type { SitesResponse } from '@/schemas/cloud/org-sites';
import { getOrgSites } from '@/services/cloud/org-sites.service';

export const ORG_SITES_QUERY_KEY = (orgId: string) => ['organizations', orgId, 'sites'] as const;

type UseOrgSitesOptions = Omit<UseQueryOptions<SitesResponse, AxiosError>, 'queryKey' | 'queryFn'>;

// Fetches all sites for the organization
export function useOrgSites(orgId: string, options?: UseOrgSitesOptions) {
  return useQuery<SitesResponse, AxiosError>({
    queryKey: ORG_SITES_QUERY_KEY(orgId),
    queryFn: () => getOrgSites(orgId),
    enabled: !!orgId,
    ...options,
  });
}
