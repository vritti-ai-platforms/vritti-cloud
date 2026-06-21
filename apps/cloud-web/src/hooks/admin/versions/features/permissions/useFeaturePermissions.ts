import { useQuery } from '@tanstack/react-query';
import type { FeaturePermissionsTableResponse } from '@/schemas/admin/feature-permissions';
import { getFeaturePermissionsTable } from '@/services/admin/versions/features/permissions.service';

export const FEATURE_PERMISSIONS_TABLE_KEY = (versionId: string, featureId: string) =>
  ['admin', 'versions', versionId, 'features', featureId, 'permissions', 'table'] as const;

// Fetches a feature's permissions data table (server-stored filter/sort/pagination state)
export function useFeaturePermissions(versionId: string, featureId: string) {
  return useQuery<FeaturePermissionsTableResponse>({
    queryKey: FEATURE_PERMISSIONS_TABLE_KEY(versionId, featureId),
    queryFn: () => getFeaturePermissionsTable(versionId, featureId),
    enabled: !!versionId && !!featureId,
  });
}
