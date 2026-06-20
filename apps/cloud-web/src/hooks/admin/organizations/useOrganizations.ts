import { type UseQueryOptions, useQuery } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import type { OrganizationsResponse } from '@/schemas/admin/organizations';
import { getOrganizations } from '../../../services/admin/organizations.service';

export const ORGANIZATIONS_QUERY_KEY = ['admin', 'organizations'] as const;

// Builds the query key for a deployment's organizations table
export function organizationsQueryKey(deploymentId: string) {
  return [...ORGANIZATIONS_QUERY_KEY, deploymentId] as const;
}

// Fetches organizations on a deployment — server applies filter/sort state
export function useOrganizations(
  deploymentId: string,
  options?: Omit<UseQueryOptions<OrganizationsResponse, AxiosError>, 'queryKey' | 'queryFn'>,
) {
  return useQuery<OrganizationsResponse, AxiosError>({
    queryKey: organizationsQueryKey(deploymentId),
    queryFn: () => getOrganizations(deploymentId),
    enabled: !!deploymentId,
    ...options,
  });
}
