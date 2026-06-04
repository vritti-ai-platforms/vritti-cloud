import { type UseQueryOptions, useQuery } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import type { OrgRole } from '@/schemas/cloud/org-roles';
import { getCompatibleRoles } from '../../../services/cloud/org-business-units.service';
import { BU_COMPATIBLE_ROLES_KEY } from './useUpdateBuApps';

type UseCompatibleRolesOptions = Omit<UseQueryOptions<OrgRole[], AxiosError>, 'queryKey' | 'queryFn'>;

// Fetches roles compatible with a business unit's assigned apps
export function useCompatibleRoles(orgId: string, buId: string, options?: UseCompatibleRolesOptions) {
  return useQuery<OrgRole[], AxiosError>({
    queryKey: BU_COMPATIBLE_ROLES_KEY(orgId, buId),
    queryFn: () => getCompatibleRoles(orgId, buId),
    enabled: !!orgId && !!buId,
    ...options,
  });
}
