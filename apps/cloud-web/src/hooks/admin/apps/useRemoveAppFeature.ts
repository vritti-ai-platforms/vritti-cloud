import { type UseMutationOptions, useMutation, useQueryClient } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import { removeAppFeature } from '../../../services/admin/apps.service';
import { appQueryKey } from './useApp';
import { APP_FEATURES_TABLE_KEY } from './useAppFeaturesTable';

type Vars = { versionId: string; appId: string; featureId: string };
type UseRemoveAppFeatureOptions = Omit<UseMutationOptions<void, AxiosError, Vars>, 'mutationFn'>;

// Removes a feature from an app and invalidates the app detail + features table
export function useRemoveAppFeature(options?: UseRemoveAppFeatureOptions) {
  const queryClient = useQueryClient();
  return useMutation<void, AxiosError, Vars>({
    ...options,
    mutationFn: removeAppFeature,
    onSuccess: (result, vars, ...args) => {
      queryClient.invalidateQueries({ queryKey: appQueryKey(vars.versionId, vars.appId) });
      queryClient.invalidateQueries({ queryKey: APP_FEATURES_TABLE_KEY(vars.versionId, vars.appId) });
      options?.onSuccess?.(result, vars, ...args);
    },
  });
}
