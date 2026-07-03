import { type UseQueryOptions, useQuery } from '@tanstack/react-query';
import type { BuMatrix } from '@vritti/api-sdk/catalog-resolver';
import type { AxiosError } from 'axios';
import { getOrgPermissions } from '../../../services/cloud/org-permissions.service';

const ORG_PERMISSIONS_QUERY_KEY = (orgId: string) => ['organizations', orgId, 'permissions'] as const;

type UsePermissionsOptions = Omit<UseQueryOptions<BuMatrix, AxiosError>, 'queryKey' | 'queryFn'>;

// Fetches the org's snapshot-driven apps/features/permissions catalog for the role permission picker
export function usePermissions(orgId: string, options?: UsePermissionsOptions) {
  return useQuery<BuMatrix, AxiosError>({
    queryKey: ORG_PERMISSIONS_QUERY_KEY(orgId),
    queryFn: () => getOrgPermissions(orgId),
    enabled: !!orgId,
    ...options,
  });
}
