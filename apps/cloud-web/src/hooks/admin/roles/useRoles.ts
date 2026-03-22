import { type UseQueryOptions, useQuery } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import type { RolesTableResponse } from '@/schemas/admin/roles';
import { getRoles } from '../../../services/admin/roles.service';

export const ROLES_QUERY_KEY = (versionId: string) => ['admin', 'versions', versionId, 'roles'] as const;

// Fetches all roles — server applies filter/sort state
export function useRoles(
  versionId: string,
  options?: Omit<UseQueryOptions<RolesTableResponse, AxiosError>, 'queryKey' | 'queryFn'>,
) {
  return useQuery<RolesTableResponse, AxiosError>({
    queryKey: ROLES_QUERY_KEY(versionId),
    queryFn: () => getRoles(versionId),
    ...options,
  });
}
