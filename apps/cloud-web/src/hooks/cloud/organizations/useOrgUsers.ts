import { type UseQueryOptions, useQuery } from '@tanstack/react-query';
import type { DataTableServerState } from '@vritti/quantum-ui/DataTable';
import type { AxiosError } from 'axios';
import type { NexusUser } from '@/schemas/cloud/organizations';
import { getOrgUsersTable } from '@/services/cloud/organizations.service';

export const ORG_USERS_QUERY_KEY = (orgId: string) => ['organizations', orgId, 'users'] as const;

type UseOrgUsersOptions = Omit<UseQueryOptions<DataTableServerState<NexusUser>, AxiosError>, 'queryKey' | 'queryFn'>;

// Fetches nexus portal users for an organization
export function useOrgUsers(orgId: string, options?: UseOrgUsersOptions) {
  return useQuery<DataTableServerState<NexusUser>, AxiosError>({
    queryKey: ORG_USERS_QUERY_KEY(orgId),
    queryFn: () => getOrgUsersTable(orgId),
    enabled: !!orgId,
    ...options,
  });
}
