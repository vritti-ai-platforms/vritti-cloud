import { type UseMutationOptions, useMutation, useQueryClient } from '@tanstack/react-query';
import type { SuccessResponse } from '@vritti/quantum-ui/types/api-response';
import type { AxiosError } from 'axios';
import { assignFeaturesToApp } from '@/services/admin/versions/businesses/features.service';
import { BUSINESS_FEATURES_TABLE_KEY } from './useBusinessFeatures';

type Vars = { versionId: string; businessId: string; appId: string; featureIds: string[] };
type UseAssignFeaturesToAppOptions = Omit<UseMutationOptions<SuccessResponse, AxiosError, Vars>, 'mutationFn'>;

// Adds many features to a business under one app in one request and refreshes the features table
export function useAssignFeaturesToApp(options?: UseAssignFeaturesToAppOptions) {
  const queryClient = useQueryClient();
  return useMutation<SuccessResponse, AxiosError, Vars>({
    ...options,
    mutationFn: assignFeaturesToApp,
    onSuccess: (result, vars, ...args) => {
      queryClient.invalidateQueries({ queryKey: BUSINESS_FEATURES_TABLE_KEY(vars.versionId, vars.businessId) });
      options?.onSuccess?.(result, vars, ...args);
    },
  });
}
