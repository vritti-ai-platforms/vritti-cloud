import { type UseSuspenseQueryOptions, useSuspenseQuery } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import type { RoleScopeSection } from '@/schemas/cloud/roles';
import { getRoles } from '../../../services/cloud/roles.service';

export const ROLES_QUERY_KEY = (orgId: string) => ['organizations', orgId, 'roles'] as const;

type UseRolesOptions = Omit<UseSuspenseQueryOptions<RoleScopeSection[], AxiosError>, 'queryKey' | 'queryFn'>;

// Fetches the organization's roles as render-ready sections (suspends until loaded)
export function useRoles(orgId: string, options?: UseRolesOptions) {
  return useSuspenseQuery<RoleScopeSection[], AxiosError>({
    queryKey: ROLES_QUERY_KEY(orgId),
    queryFn: () => getRoles(orgId),
    ...options,
  });
}
