import { type UseMutationOptions, useMutation, useQueryClient } from '@tanstack/react-query';
import type { SuccessResponse } from '@vritti/quantum-ui/api-response';
import type { AxiosError } from 'axios';
import type { MicrofrontendPlatformParam } from '@/schemas/admin/microfrontends';
import { removeFeatureMicrofrontend } from '@/services/admin/versions/features/microfrontends.service';
import { featureMicrofrontendsKey } from './useFeatureMicrofrontends';

type Vars = { platform: MicrofrontendPlatformParam };
type UseRemoveFeatureMicrofrontendOptions = Omit<UseMutationOptions<SuccessResponse, AxiosError, Vars>, 'mutationFn'>;

// Removes a microfrontend link from a feature for a platform
export function useRemoveFeatureMicrofrontend(
  versionId: string,
  featureId: string,
  options?: UseRemoveFeatureMicrofrontendOptions,
) {
  const queryClient = useQueryClient();
  return useMutation<SuccessResponse, AxiosError, Vars>({
    ...options,
    mutationFn: ({ platform }) => removeFeatureMicrofrontend({ versionId, featureId, platform }),
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: featureMicrofrontendsKey(versionId, featureId) });
      options?.onSuccess?.(...args);
    },
  });
}
