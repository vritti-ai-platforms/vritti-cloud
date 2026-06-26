import { type UseMutationOptions, useMutation, useQueryClient } from '@tanstack/react-query';
import type { CreateResponse } from '@vritti/quantum-ui/api-response';
import type { AxiosError } from 'axios';
import type { Feature, SetFeatureMicrofrontendData } from '@/schemas/admin/features';
import type { MicrofrontendPlatformParam } from '@/schemas/admin/microfrontends';
import { setFeatureMicrofrontend } from '@/services/admin/versions/features/microfrontends.service';
import { featureMicrofrontendsKey } from './useFeatureMicrofrontends';

type Vars = { platform: MicrofrontendPlatformParam; data: SetFeatureMicrofrontendData };
type UseSetFeatureMicrofrontendOptions = Omit<
  UseMutationOptions<CreateResponse<Feature>, AxiosError, Vars>,
  'mutationFn'
>;

// Links or updates a microfrontend on a feature for a platform
export function useSetFeatureMicrofrontend(
  versionId: string,
  featureId: string,
  options?: UseSetFeatureMicrofrontendOptions,
) {
  const queryClient = useQueryClient();
  return useMutation<CreateResponse<Feature>, AxiosError, Vars>({
    ...options,
    mutationFn: ({ platform, data }) => setFeatureMicrofrontend({ versionId, featureId, platform, data }),
    onSuccess: (result, ...args) => {
      queryClient.invalidateQueries({ queryKey: featureMicrofrontendsKey(versionId, featureId) });
      options?.onSuccess?.(result, ...args);
    },
  });
}
