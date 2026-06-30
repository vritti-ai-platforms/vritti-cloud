import { useSuspenseQuery } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import type { RoleTemplatePermissionsResponse } from '@/schemas/admin/role-templates';
import { getRoleTemplatePermissions } from '@/services/admin/versions/businesses/role-templates.service';

export function roleTemplatePermissionsQueryKey(versionId: string, roleId: string) {
  return ['admin', 'versions', versionId, 'role-templates', roleId, 'permissions'] as const;
}

// Kept for callers that invalidate by prefix
export const roleTemplatePermissionsPrefixKey = roleTemplatePermissionsQueryKey;

// Fetches the role-template grant matrix — the role's apps (catalog) with their current grants. Suspense so the
// editor mounts with data already present (and can seed react-hook-form defaultValues directly).
export function useRoleTemplateGrants(versionId: string, businessId: string, roleId: string) {
  return useSuspenseQuery<RoleTemplatePermissionsResponse, AxiosError>({
    queryKey: roleTemplatePermissionsQueryKey(versionId, roleId),
    queryFn: () => getRoleTemplatePermissions(versionId, businessId, roleId),
  });
}
