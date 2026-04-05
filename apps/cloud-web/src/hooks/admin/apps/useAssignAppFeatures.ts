import { type UseMutationOptions, useMutation, useQueryClient } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import type { SuccessResponse } from '@vritti/quantum-ui/api-response';
import { assignAppFeature } from '../../../services/admin/apps.service';
import { appQueryKey } from './useApp';
import { APP_FEATURES_TABLE_KEY } from './useAppFeaturesTable';

type Vars = { versionId: string; appId: string; featureId: string };
type UseAssignAppFeatureOptions = Omit<UseMutationOptions<SuccessResponse, AxiosError, Vars>, 'mutationFn'>;

// Assigns a feature to an app and invalidates the app detail + features table
export function useAssignAppFeature(options?: UseAssignAppFeatureOptions) {
  const queryClient = useQueryClient();
  return useMutation<SuccessResponse, AxiosError, Vars>({
    ...options,
    mutationFn: assignAppFeature,
    onSuccess: (result, vars, ...args) => {
      queryClient.invalidateQueries({ queryKey: appQueryKey(vars.versionId, vars.appId) });
      queryClient.invalidateQueries({ queryKey: APP_FEATURES_TABLE_KEY(vars.versionId, vars.appId) });
      options?.onSuccess?.(result, vars, ...args);
    },
  });
}
