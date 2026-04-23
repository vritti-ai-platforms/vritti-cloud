import { useSuspenseQuery } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import type { Feature } from '@/schemas/admin/features';
import { getFeature } from '../../../services/admin/features.service';

export function featureQueryKey(versionId: string, id: string) {
  return ['admin', 'versions', versionId, 'features', id] as const;
}

// Fetches a single feature by ID — suspends until data is ready
export function useFeature(versionId: string, id: string) {
  return useSuspenseQuery<Feature, AxiosError>({
    queryKey: featureQueryKey(versionId, id),
    queryFn: () => getFeature(versionId, id),
  });
}
