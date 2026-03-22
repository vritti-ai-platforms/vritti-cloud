import { type UseMutationOptions, useMutation, useQueryClient } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import type { SuccessResponse } from '@vritti/quantum-ui/api-response';
import { setFeatureMicrofrontend } from '../../../services/admin/feature-microfrontends.service';
import { featureMicrofrontendsKey } from './useFeatureMicrofrontends';

type Vars = { microfrontendId: string; exposedModule: string; routePrefix: string };
type UseSetFeatureMicrofrontendOptions = Omit<UseMutationOptions<SuccessResponse, AxiosError, Vars>, 'mutationFn'>;

// Links or updates a microfrontend on a feature
export function useSetFeatureMicrofrontend(
  versionId: string,
  featureId: string,
  options?: UseSetFeatureMicrofrontendOptions,
) {
  const queryClient = useQueryClient();
  return useMutation<SuccessResponse, AxiosError, Vars>({
    ...options,
    mutationFn: ({ microfrontendId, exposedModule, routePrefix }) =>
      setFeatureMicrofrontend({
        versionId,
        featureId,
        microfrontendId,
        data: { exposedModule, routePrefix },
      }),
    onSuccess: (result, ...args) => {
      queryClient.invalidateQueries({ queryKey: featureMicrofrontendsKey(versionId, featureId) });
      options?.onSuccess?.(result, ...args);
    },
  });
}
