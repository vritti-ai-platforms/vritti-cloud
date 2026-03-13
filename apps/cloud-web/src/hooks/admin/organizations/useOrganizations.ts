import { type UseQueryOptions, useQuery } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import type { OrganizationsResponse } from '@/schemas/admin/organizations';
import { getOrganizations } from '../../../services/admin/organizations.service';

export const ORGANIZATIONS_QUERY_KEY = ['admin', 'organizations'] as const;

// Fetches all organizations — server applies filter/sort state
export function useOrganizations(options?: Omit<UseQueryOptions<OrganizationsResponse, AxiosError>, 'queryKey' | 'queryFn'>) {
  return useQuery<OrganizationsResponse, AxiosError>({
    queryKey: ORGANIZATIONS_QUERY_KEY,
    queryFn: getOrganizations,
    ...options,
  });
}
