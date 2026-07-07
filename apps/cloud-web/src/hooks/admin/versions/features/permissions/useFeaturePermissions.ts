import { useQuery } from '@tanstack/react-query';
import type { FeaturePermission } from '@/schemas/admin/feature-permissions';
import { getFeaturePermissions } from '@/services/admin/versions/features/permissions.service';

export const FEATURE_PERMISSIONS_KEY = (versionId: string, featureId: string) =>
  ['admin', 'versions', versionId, 'features', featureId, 'permissions'] as const;

// Fetches a feature's permissions ordered by sortOrder
export function useFeaturePermissions(versionId: string, featureId: string) {
  return useQuery<FeaturePermission[]>({
    queryKey: FEATURE_PERMISSIONS_KEY(versionId, featureId),
    queryFn: () => getFeaturePermissions(versionId, featureId),
    enabled: !!versionId && !!featureId,
  });
}
