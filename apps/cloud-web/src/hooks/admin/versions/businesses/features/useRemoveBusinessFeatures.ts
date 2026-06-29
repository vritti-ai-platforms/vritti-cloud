import { type UseMutationOptions, useMutation, useQueryClient } from '@tanstack/react-query';
import type { SuccessResponse } from '@vritti/quantum-ui/api-response';
import type { AxiosError } from 'axios';
import { removeBusinessFeatures } from '@/services/admin/versions/businesses/features.service';
import { BUSINESS_FEATURES_TABLE_KEY } from './useBusinessFeatures';

type Vars = { versionId: string; businessId: string; featureIds: string[] };
type UseRemoveBusinessFeaturesOptions = Omit<UseMutationOptions<SuccessResponse, AxiosError, Vars>, 'mutationFn'>;

// Removes many features from a business in one request and refreshes the features table
export function useRemoveBusinessFeatures(options?: UseRemoveBusinessFeaturesOptions) {
  const queryClient = useQueryClient();
  return useMutation<SuccessResponse, AxiosError, Vars>({
    ...options,
    mutationFn: removeBusinessFeatures,
    onSuccess: (result, vars, ...args) => {
      queryClient.invalidateQueries({ queryKey: BUSINESS_FEATURES_TABLE_KEY(vars.versionId, vars.businessId) });
      options?.onSuccess?.(result, vars, ...args);
    },
  });
}
