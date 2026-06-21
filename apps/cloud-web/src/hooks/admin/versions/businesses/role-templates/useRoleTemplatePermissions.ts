import { type UseQueryOptions, useQuery } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import type { RoleTemplatePermissionsResponse } from '@/schemas/admin/role-templates';
import { getRoleTemplatePermissions } from '@/services/admin/versions/businesses/role-templates.service';

export function roleTemplatePermissionsQueryKey(versionId: string, roleId: string) {
  return ['admin', 'versions', versionId, 'role-templates', roleId, 'permissions'] as const;
}

// Kept for callers that invalidate by prefix
export const roleTemplatePermissionsPrefixKey = roleTemplatePermissionsQueryKey;

// Fetches the role-template permission matrix (the role's apps with their features + the full grant set)
export function useRoleTemplatePermissions(
  versionId: string,
  businessId: string,
  roleId: string,
  options?: Omit<UseQueryOptions<RoleTemplatePermissionsResponse, AxiosError>, 'queryKey' | 'queryFn'>,
) {
  return useQuery<RoleTemplatePermissionsResponse, AxiosError>({
    queryKey: roleTemplatePermissionsQueryKey(versionId, roleId),
    queryFn: () => getRoleTemplatePermissions(versionId, businessId, roleId),
    enabled: !!businessId && !!roleId,
    ...options,
  });
}
