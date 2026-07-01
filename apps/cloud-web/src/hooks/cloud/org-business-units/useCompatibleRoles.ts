import { type UseQueryOptions, useQuery } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import type { Role } from '@/schemas/cloud/roles';
import { getCompatibleRoles } from '../../../services/cloud/org-business-units.service';

export const BU_COMPATIBLE_ROLES_KEY = (orgId: string, buId: string) =>
  ['organizations', orgId, 'business-units', buId, 'compatible-roles'] as const;

type UseCompatibleRolesOptions = Omit<UseQueryOptions<Role[], AxiosError>, 'queryKey' | 'queryFn'>;

// Fetches roles compatible with a business unit's assigned apps
export function useCompatibleRoles(orgId: string, buId: string, options?: UseCompatibleRolesOptions) {
  return useQuery<Role[], AxiosError>({
    queryKey: BU_COMPATIBLE_ROLES_KEY(orgId, buId),
    queryFn: () => getCompatibleRoles(orgId, buId),
    enabled: !!orgId && !!buId,
    ...options,
  });
}
