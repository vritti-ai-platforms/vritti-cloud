import { type UseQueryOptions, useQuery } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import type { FeaturesTableResponse } from '@/schemas/admin/features';
import { getFeatures } from '../../../services/admin/features.service';

export const FEATURES_QUERY_KEY = (versionId: string) => ['admin', 'versions', versionId, 'features'] as const;

// Fetches all features — server applies filter/sort state
export function useFeatures(
  versionId: string,
  options?: Omit<UseQueryOptions<FeaturesTableResponse, AxiosError>, 'queryKey' | 'queryFn'>,
) {
  return useQuery<FeaturesTableResponse, AxiosError>({
    queryKey: FEATURES_QUERY_KEY(versionId),
    queryFn: () => getFeatures(versionId),
    ...options,
  });
}
