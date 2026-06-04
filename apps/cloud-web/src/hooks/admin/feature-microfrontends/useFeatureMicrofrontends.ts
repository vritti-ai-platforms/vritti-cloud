import { type UseQueryOptions, useQuery } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import type { FeatureMicrofrontend } from '@/schemas/admin/features';
import { getFeatureMicrofrontends } from '../../../services/admin/feature-microfrontends.service';

export function featureMicrofrontendsKey(versionId: string, featureId: string) {
  return ['admin', 'versions', versionId, 'features', featureId, 'microfrontends'] as const;
}

// Fetches microfrontend links for a feature
export function useFeatureMicrofrontends(
  versionId: string,
  featureId: string,
  options?: Omit<UseQueryOptions<FeatureMicrofrontend[], AxiosError>, 'queryKey' | 'queryFn'>,
) {
  return useQuery<FeatureMicrofrontend[], AxiosError>({
    queryKey: featureMicrofrontendsKey(versionId, featureId),
    queryFn: () => getFeatureMicrofrontends(versionId, featureId),
    enabled: !!versionId && !!featureId,
    ...options,
  });
}
