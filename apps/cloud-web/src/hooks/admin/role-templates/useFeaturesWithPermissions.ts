import { type UseQueryOptions, useQuery } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import type { FeatureWithPermissions } from '@/schemas/admin/role-templates';
import { getFeaturesWithPermissions } from '../../../services/admin/role-templates.service';

export function featuresWithPermissionsQueryKey(versionId: string, roleTemplateId: string) {
  return ['admin', 'versions', versionId, 'role-templates', roleTemplateId, 'permissions', 'features'] as const;
}

export function useFeaturesWithPermissions(
  versionId: string,
  roleTemplateId: string,
  options?: Omit<UseQueryOptions<FeatureWithPermissions[], AxiosError>, 'queryKey' | 'queryFn'>,
) {
  return useQuery<FeatureWithPermissions[], AxiosError>({
    queryKey: featuresWithPermissionsQueryKey(versionId, roleTemplateId),
    queryFn: () => getFeaturesWithPermissions(versionId, roleTemplateId),
    enabled: !!versionId && !!roleTemplateId,
    ...options,
  });
}
