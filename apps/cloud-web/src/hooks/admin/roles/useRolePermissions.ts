import { type UseQueryOptions, useQuery } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import type { GroupedPermission } from '@/schemas/admin/roles';
import { getRolePermissions } from '../../../services/admin/roles.service';

export function rolePermissionsQueryKey(versionId: string, roleId: string) {
  return ['admin', 'versions', versionId, 'roles', roleId, 'permissions'] as const;
}

// Fetches grouped permissions for a role
export function useRolePermissions(
  versionId: string,
  roleId: string,
  options?: Omit<UseQueryOptions<GroupedPermission[], AxiosError>, 'queryKey' | 'queryFn'>,
) {
  return useQuery<GroupedPermission[], AxiosError>({
    queryKey: rolePermissionsQueryKey(versionId, roleId),
    queryFn: () => getRolePermissions(versionId, roleId),
    enabled: !!roleId,
    ...options,
  });
}
