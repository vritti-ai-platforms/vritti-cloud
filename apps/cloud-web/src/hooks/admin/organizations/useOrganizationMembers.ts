import { type UseQueryOptions, useQuery } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import type { OrganizationMembersResponse } from '@/schemas/admin/organizations';
import { getOrganizationMembers } from '../../../services/admin/organizations.service';

export const ORGANIZATION_MEMBERS_QUERY_KEY_FN = (id: string) => ['admin', 'organizations', id, 'members'] as const;

// Fetches organization members — server applies filter/sort state
export function useOrganizationMembers(
  id: string,
  options?: Omit<UseQueryOptions<OrganizationMembersResponse, AxiosError>, 'queryKey' | 'queryFn'>,
) {
  return useQuery<OrganizationMembersResponse, AxiosError>({
    queryKey: ORGANIZATION_MEMBERS_QUERY_KEY_FN(id),
    queryFn: () => getOrganizationMembers(id),
    ...options,
  });
}
