import { type UseQueryOptions, useQuery } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import type { GroupedPermission } from '@/schemas/admin/role-templates';
import { getRoleTemplatePermissions } from '../../../services/admin/role-templates.service';

export function roleTemplatePermissionsQueryKey(versionId: string, roleId: string) {
  return ['admin', 'versions', versionId, 'role-templates', roleId, 'permissions'] as const;
}

// Fetches a role template's granted permissions grouped by feature
export function useRoleTemplatePermissions(
  versionId: string,
  businessId: string,
  roleId: string,
  options?: Omit<UseQueryOptions<GroupedPermission[], AxiosError>, 'queryKey' | 'queryFn'>,
) {
  return useQuery<GroupedPermission[], AxiosError>({
    queryKey: roleTemplatePermissionsQueryKey(versionId, roleId),
    queryFn: () => getRoleTemplatePermissions(versionId, businessId, roleId),
    enabled: !!businessId && !!roleId,
    ...options,
  });
}
