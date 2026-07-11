import { useSuspenseQuery } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import type { Site } from '@/schemas/cloud/org-sites';
import { getOrgSite } from '@/services/cloud/org-sites.service';

export const ORG_SITE_DETAIL_QUERY_KEY = (orgId: string, siteId: string) =>
  ['organizations', orgId, 'sites', siteId] as const;

// Fetches a single site by ID — suspends until data is ready
export function useOrgSite(orgId: string, siteId: string) {
  return useSuspenseQuery<Site, AxiosError>({
    queryKey: ORG_SITE_DETAIL_QUERY_KEY(orgId, siteId),
    queryFn: () => getOrgSite(orgId, siteId),
  });
}
