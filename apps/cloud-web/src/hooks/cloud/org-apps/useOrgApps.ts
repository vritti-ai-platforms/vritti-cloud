import { type UseQueryOptions, useQuery } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import type { OrgAppsResponse } from '@/schemas/cloud/org-apps';
import { getOrgApps } from '../../../services/cloud/org-apps.service';

export const ORG_APPS_QUERY_KEY = (orgId: string) => ['organizations', orgId, 'apps'] as const;

type UseOrgAppsOptions = Omit<UseQueryOptions<OrgAppsResponse, AxiosError>, 'queryKey' | 'queryFn'>;

// Fetches all apps available to the organization
export function useOrgApps(orgId: string, options?: UseOrgAppsOptions) {
  return useQuery<OrgAppsResponse, AxiosError>({
    queryKey: ORG_APPS_QUERY_KEY(orgId),
    queryFn: () => getOrgApps(orgId),
    enabled: !!orgId,
    ...options,
  });
}
