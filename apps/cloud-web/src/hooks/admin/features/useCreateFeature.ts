import { type UseMutationOptions, useMutation, useQueryClient } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import type { CreateFeatureData, Feature } from '@/schemas/admin/features';
import { createFeature } from '../../../services/admin/features.service';
import { FEATURES_QUERY_KEY } from './useFeatures';

type UseCreateFeatureOptions = Omit<UseMutationOptions<Feature, AxiosError, CreateFeatureData>, 'mutationFn'>;

// Creates a new feature and invalidates the features list
export function useCreateFeature(versionId: string, options?: UseCreateFeatureOptions) {
  const queryClient = useQueryClient();
  return useMutation<Feature, AxiosError, CreateFeatureData>({
    ...options,
    mutationFn: (data) => createFeature(versionId, data),
    onSuccess: (result, ...args) => {
      queryClient.invalidateQueries({ queryKey: FEATURES_QUERY_KEY(versionId) });
      options?.onSuccess?.(result, ...args);
    },
  });
}
