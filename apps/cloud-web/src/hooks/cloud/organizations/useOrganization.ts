import { type UseQueryOptions, useQuery } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import type { OrgListItem } from '@/schemas/cloud/organizations';
import { getOrganization } from '@/services/cloud/organizations.service';

export const ORG_QUERY_KEY = (orgId: string) => ['organizations', orgId] as const;

type UseOrganizationOptions = Omit<UseQueryOptions<OrgListItem, AxiosError>, 'queryKey' | 'queryFn'>;

// Fetches a single organization by ID
export function useOrganization(orgId: string, options?: UseOrganizationOptions) {
  return useQuery<OrgListItem, AxiosError>({
    queryKey: ORG_QUERY_KEY(orgId),
    queryFn: () => getOrganization(orgId),
    enabled: !!orgId,
    ...options,
  });
}
