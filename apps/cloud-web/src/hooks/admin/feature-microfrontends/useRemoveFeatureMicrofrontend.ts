import { type UseMutationOptions, useMutation, useQueryClient } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import { removeFeatureMicrofrontend } from '../../../services/admin/feature-microfrontends.service';
import { featureMicrofrontendsKey } from './useFeatureMicrofrontends';

type UseRemoveFeatureMicrofrontendOptions = Omit<UseMutationOptions<void, AxiosError, string>, 'mutationFn'>;

// Removes a microfrontend link from a feature
export function useRemoveFeatureMicrofrontend(
  versionId: string,
  featureId: string,
  options?: UseRemoveFeatureMicrofrontendOptions,
) {
  const queryClient = useQueryClient();
  return useMutation<void, AxiosError, string>({
    ...options,
    mutationFn: (microfrontendId) =>
      removeFeatureMicrofrontend({ versionId, featureId, microfrontendId }),
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: featureMicrofrontendsKey(versionId, featureId) });
      options?.onSuccess?.(...args);
    },
  });
}
