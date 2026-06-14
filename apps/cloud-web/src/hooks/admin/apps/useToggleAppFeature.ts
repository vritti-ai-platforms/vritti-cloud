import { type UseMutationOptions, useMutation, useQueryClient } from '@tanstack/react-query';
import type { SuccessResponse } from '@vritti/quantum-ui/api-response';
import type { AxiosError } from 'axios';
import { toggleAppFeature } from '../../../services/admin/apps.service';
import { appQueryKey } from './useApp';
import { APP_FEATURES_TABLE_KEY } from './useAppFeaturesTable';

type Vars = { versionId: string; businessId: string; appId: string; featureId: string };
type UseToggleAppFeatureOptions = Omit<UseMutationOptions<SuccessResponse, AxiosError, Vars>, 'mutationFn'>;

// Toggles a feature assignment for an app and invalidates the app detail + features table
export function useToggleAppFeature(options?: UseToggleAppFeatureOptions) {
  const queryClient = useQueryClient();
  return useMutation<SuccessResponse, AxiosError, Vars>({
    ...options,
    mutationFn: toggleAppFeature,
    onSuccess: (result, vars, ...args) => {
      queryClient.invalidateQueries({ queryKey: appQueryKey(vars.versionId, vars.businessId, vars.appId) });
      queryClient.invalidateQueries({ queryKey: APP_FEATURES_TABLE_KEY(vars.versionId, vars.businessId, vars.appId) });
      options?.onSuccess?.(result, vars, ...args);
    },
  });
}
