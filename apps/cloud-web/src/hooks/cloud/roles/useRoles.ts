import { type UseQueryOptions, useQuery } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import type { Role } from '@/schemas/cloud/roles';
import { getRoles } from '../../../services/cloud/roles.service';

export const ROLES_QUERY_KEY = (orgId: string) => ['organizations', orgId, 'roles'] as const;

type UseRolesOptions = Omit<UseQueryOptions<Role[], AxiosError>, 'queryKey' | 'queryFn'>;

// Fetches all roles for the organization
export function useRoles(orgId: string, options?: UseRolesOptions) {
  return useQuery<Role[], AxiosError>({
    queryKey: ROLES_QUERY_KEY(orgId),
    queryFn: () => getRoles(orgId),
    enabled: !!orgId,
    ...options,
  });
}
