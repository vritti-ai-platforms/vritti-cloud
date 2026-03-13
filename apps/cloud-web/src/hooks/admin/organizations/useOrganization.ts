import { type UseQueryOptions, useQuery } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import type { AdminOrganizationDetail } from '@/schemas/admin/organizations';
import { getOrganization } from '../../../services/admin/organizations.service';

// Fetches a single organization by ID with full details
export function useOrganization(id: string, options?: Omit<UseQueryOptions<AdminOrganizationDetail, AxiosError>, 'queryKey' | 'queryFn'>) {
  return useQuery<AdminOrganizationDetail, AxiosError>({
    queryKey: ['admin', 'organizations', id],
    queryFn: () => getOrganization(id),
    ...options,
  });
}
