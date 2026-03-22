import { type UseQueryOptions, useQuery } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import type { OrgRole } from '@/schemas/cloud/org-roles';
import { getOrgRoles } from '../../../services/cloud/org-roles.service';

export const ORG_ROLES_QUERY_KEY = (orgId: string) => ['organizations', orgId, 'roles'] as const;

type UseOrgRolesOptions = Omit<UseQueryOptions<OrgRole[], AxiosError>, 'queryKey' | 'queryFn'>;

// Fetches all roles for the organization
export function useOrgRoles(orgId: string, options?: UseOrgRolesOptions) {
  return useQuery<OrgRole[], AxiosError>({
    queryKey: ORG_ROLES_QUERY_KEY(orgId),
    queryFn: () => getOrgRoles(orgId),
    enabled: !!orgId,
    ...options,
  });
}
