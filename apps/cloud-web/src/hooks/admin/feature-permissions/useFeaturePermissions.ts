import { type UseQueryOptions, useQuery } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import { getFeaturePermissions } from '../../../services/admin/feature-permissions.service';

export function featurePermissionsKey(versionId: string, featureId: string) {
  return ['admin', 'versions', versionId, 'feature-permissions', featureId] as const;
}

// Fetches the permission types for a feature
export function useFeaturePermissions(
  versionId: string,
  featureId: string,
  options?: Omit<UseQueryOptions<{ types: string[] }, AxiosError>, 'queryKey' | 'queryFn'>,
) {
  return useQuery<{ types: string[] }, AxiosError>({
    queryKey: featurePermissionsKey(versionId, featureId),
    queryFn: () => getFeaturePermissions(versionId, featureId),
    enabled: !!featureId,
    ...options,
  });
}
