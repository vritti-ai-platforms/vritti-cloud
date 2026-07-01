import { useQuery } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import type { PermissionUsage } from '@/schemas/admin/feature-permissions';
import { getPermissionUsage } from '@/services/admin/versions/features/permissions.service';

export const PERMISSION_USAGE_KEY = (versionId: string, permissionId: string) =>
  ['admin', 'versions', versionId, 'permissions', permissionId, 'usage'] as const;

// Fetches the business-wise usage (plans + role templates) of a permission — used by the delete-impact dialog
export function usePermissionUsage(versionId: string, permissionId: string) {
  return useQuery<PermissionUsage, AxiosError>({
    queryKey: PERMISSION_USAGE_KEY(versionId, permissionId),
    queryFn: () => getPermissionUsage(versionId, permissionId),
    enabled: !!versionId && !!permissionId,
  });
}
