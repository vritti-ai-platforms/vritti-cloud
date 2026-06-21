import { type UseMutationOptions, useMutation, useQueryClient } from '@tanstack/react-query';
import type { SuccessResponse } from '@vritti/quantum-ui/api-response';
import type { AxiosError } from 'axios';
import type { SetFeatureAppsData } from '@/schemas/admin/business-features';
import { setBusinessFeatureApps } from '@/services/admin/versions/businesses/features.service';
import { BUSINESS_FEATURES_TABLE_KEY } from './useBusinessFeatures';

type Vars = { versionId: string; businessId: string; featureId: string; data: SetFeatureAppsData };
type UseSetBusinessFeatureAppsOptions = Omit<UseMutationOptions<SuccessResponse, AxiosError, Vars>, 'mutationFn'>;

// Replaces a feature's app assignments within a business and refreshes the features table
export function useSetBusinessFeatureApps(options?: UseSetBusinessFeatureAppsOptions) {
  const queryClient = useQueryClient();
  return useMutation<SuccessResponse, AxiosError, Vars>({
    ...options,
    mutationFn: setBusinessFeatureApps,
    onSuccess: (result, vars, ...args) => {
      queryClient.invalidateQueries({ queryKey: BUSINESS_FEATURES_TABLE_KEY(vars.versionId, vars.businessId) });
      options?.onSuccess?.(result, vars, ...args);
    },
  });
}
