import { type UseMutationOptions, useMutation, useQueryClient } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import { deleteFeature } from '../../../services/admin/features.service';
import { FEATURES_QUERY_KEY } from './useFeatures';

type UseDeleteFeatureOptions = Omit<UseMutationOptions<void, AxiosError, string>, 'mutationFn'>;

// Deletes a feature and invalidates the features list
export function useDeleteFeature(versionId: string, options?: UseDeleteFeatureOptions) {
  const queryClient = useQueryClient();
  return useMutation<void, AxiosError, string>({
    ...options,
    mutationFn: (id) => deleteFeature(versionId, id),
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: FEATURES_QUERY_KEY(versionId) });
      options?.onSuccess?.(...args);
    },
  });
}
