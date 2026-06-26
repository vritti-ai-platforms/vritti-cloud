import { type UseQueryOptions, useQuery } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import type { FeatureMicrofrontendLinks } from '@/schemas/admin/features';
import { getFeatureMicrofrontends } from '@/services/admin/versions/features/microfrontends.service';

export function featureMicrofrontendsKey(versionId: string, featureId: string) {
  return ['admin', 'versions', versionId, 'features', featureId, 'microfrontends'] as const;
}

// Fetches the per-platform microfrontend links for a feature
export function useFeatureMicrofrontends(
  versionId: string,
  featureId: string,
  options?: Omit<UseQueryOptions<FeatureMicrofrontendLinks, AxiosError>, 'queryKey' | 'queryFn'>,
) {
  return useQuery<FeatureMicrofrontendLinks, AxiosError>({
    queryKey: featureMicrofrontendsKey(versionId, featureId),
    queryFn: () => getFeatureMicrofrontends(versionId, featureId),
    enabled: !!versionId && !!featureId,
    ...options,
  });
}
