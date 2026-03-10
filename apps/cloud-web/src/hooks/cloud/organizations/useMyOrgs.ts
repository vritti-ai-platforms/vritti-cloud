import { type UseQueryOptions, useQuery } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import type { OrgListItem, PaginatedResponse } from '@/schemas/cloud/organizations';
import { getMyOrgs } from '@/services/cloud/organizations.service';

export const MY_ORGS_QUERY_KEY = (params?: { offset?: number; limit?: number }) =>
  ['organizations', 'me', params ?? {}] as const;

// Fetches the paginated list of organizations the current user belongs to
export function useMyOrgs(
  params?: { offset?: number; limit?: number },
  options?: Omit<UseQueryOptions<PaginatedResponse<OrgListItem>, AxiosError>, 'queryKey' | 'queryFn'>,
) {
  return useQuery<PaginatedResponse<OrgListItem>, AxiosError>({
    queryKey: MY_ORGS_QUERY_KEY(params),
    queryFn: () => getMyOrgs(params),
    ...options,
  });
}
