import { type UseMutationOptions, useMutation, useQueryClient } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import type { SuccessResponse } from '@vritti/quantum-ui/api-response';
import type { UpdateFeatureData } from '@/schemas/admin/features';
import { updateFeature } from '../../../services/admin/features.service';
import { FEATURES_QUERY_KEY } from './useFeatures';

type UpdateFeatureVars = { id: string; data: UpdateFeatureData };
type UseUpdateFeatureOptions = Omit<UseMutationOptions<SuccessResponse, AxiosError, UpdateFeatureVars>, 'mutationFn'>;

// Updates a feature and invalidates the features list
export function useUpdateFeature(versionId: string, options?: UseUpdateFeatureOptions) {
  const queryClient = useQueryClient();
  return useMutation<SuccessResponse, AxiosError, UpdateFeatureVars>({
    ...options,
    mutationFn: (vars) => updateFeature(versionId, vars),
    onSuccess: (result, ...args) => {
      queryClient.invalidateQueries({ queryKey: FEATURES_QUERY_KEY(versionId) });
      options?.onSuccess?.(result, ...args);
    },
  });
}
