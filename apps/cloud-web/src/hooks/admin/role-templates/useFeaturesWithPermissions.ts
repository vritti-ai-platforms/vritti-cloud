import { type UseQueryOptions, useQuery } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import type { FeatureWithPermissions } from '@/schemas/admin/role-templates';
import { getFeaturesWithPermissions } from '../../../services/admin/role-templates.service';

export function featuresWithPermissionsQueryKey(versionId: string) {
  return ['admin', 'versions', versionId, 'features', 'with-permissions'] as const;
}

export function useFeaturesWithPermissions(
  versionId: string,
  options?: Omit<UseQueryOptions<FeatureWithPermissions[], AxiosError>, 'queryKey' | 'queryFn'>,
) {
  return useQuery<FeatureWithPermissions[], AxiosError>({
    queryKey: featuresWithPermissionsQueryKey(versionId),
    queryFn: () => getFeaturesWithPermissions(versionId),
    enabled: !!versionId,
    ...options,
  });
}
