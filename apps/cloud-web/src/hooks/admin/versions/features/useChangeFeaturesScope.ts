import { type UseMutationOptions, useMutation, useQueryClient } from '@tanstack/react-query';
import type { SuccessResponse } from '@vritti/quantum-ui/types/api-response';
import type { AxiosError } from 'axios';
import type { ChangeFeaturesScopeData } from '@/schemas/admin/features';
import { changeFeaturesScope } from '@/services/admin/versions/features.service';
import { FEATURES_QUERY_KEY } from './useFeatures';

type UseChangeFeaturesScopeOptions = Omit<
  UseMutationOptions<SuccessResponse, AxiosError, ChangeFeaturesScopeData>,
  'mutationFn'
>;

// Bulk-changes feature scope and invalidates the features list
export function useChangeFeaturesScope(versionId: string, options?: UseChangeFeaturesScopeOptions) {
  const queryClient = useQueryClient();
  return useMutation<SuccessResponse, AxiosError, ChangeFeaturesScopeData>({
    ...options,
    mutationFn: (data) => changeFeaturesScope(versionId, data),
    onSuccess: (result, ...args) => {
      queryClient.invalidateQueries({ queryKey: FEATURES_QUERY_KEY(versionId) });
      options?.onSuccess?.(result, ...args);
    },
  });
}
