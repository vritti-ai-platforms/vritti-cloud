import { type UseMutationOptions, useMutation, useQueryClient } from '@tanstack/react-query';
import type { SuccessResponse } from '@vritti/quantum-ui/api-response';
import type { AxiosError } from 'axios';
import { setBusinessFeatureApp } from '@/services/admin/versions/businesses/features.service';
import { BUSINESS_FEATURES_TABLE_KEY } from './useBusinessFeatures';

type Vars = { versionId: string; businessId: string; featureId: string; data: { appId: string | null } };
type UseSetBusinessFeatureAppOptions = Omit<UseMutationOptions<SuccessResponse, AxiosError, Vars>, 'mutationFn'>;

// Pins a feature to a single app within a business (or removes it) and refreshes the features table
export function useSetBusinessFeatureApp(options?: UseSetBusinessFeatureAppOptions) {
  const queryClient = useQueryClient();
  return useMutation<SuccessResponse, AxiosError, Vars>({
    ...options,
    mutationFn: setBusinessFeatureApp,
    onSuccess: (result, vars, ...args) => {
      queryClient.invalidateQueries({ queryKey: BUSINESS_FEATURES_TABLE_KEY(vars.versionId, vars.businessId) });
      options?.onSuccess?.(result, vars, ...args);
    },
  });
}
