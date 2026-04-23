import { type UseQueryOptions, useQuery } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import type { OrgPermissionGroup } from '@/schemas/cloud/org-roles';
import { getOrgPermissions } from '../../../services/cloud/org-permissions.service';

export const ORG_PERMISSIONS_QUERY_KEY = (orgId: string) => ['organizations', orgId, 'permissions'] as const;

type UseOrgPermissionsOptions = Omit<UseQueryOptions<OrgPermissionGroup[], AxiosError>, 'queryKey' | 'queryFn'>;

// Fetches permissions grouped by app for the role permission picker
export function useOrgPermissions(orgId: string, options?: UseOrgPermissionsOptions) {
  return useQuery<OrgPermissionGroup[], AxiosError>({
    queryKey: ORG_PERMISSIONS_QUERY_KEY(orgId),
    queryFn: () => getOrgPermissions(orgId),
    enabled: !!orgId,
    ...options,
  });
}
