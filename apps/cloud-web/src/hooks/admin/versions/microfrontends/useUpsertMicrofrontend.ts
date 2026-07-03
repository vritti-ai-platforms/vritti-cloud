import { type UseMutationOptions, useMutation, useQueryClient } from '@tanstack/react-query';
import type { CreateResponse } from '@vritti/quantum-ui/types/api-response';
import type { AxiosError } from 'axios';
import type { Microfrontend, MicrofrontendData, MicrofrontendPlatformParam } from '@/schemas/admin/microfrontends';
import { upsertMicrofrontend } from '@/services/admin/versions/microfrontends.service';
import { microfrontendsTableKey } from './useMicrofrontendsTable';

type UpsertMicrofrontendVars = { versionId: string; platform: MicrofrontendPlatformParam; data: MicrofrontendData };
type UseUpsertMicrofrontendOptions = Omit<
  UseMutationOptions<CreateResponse<Microfrontend>, AxiosError, UpsertMicrofrontendVars>,
  'mutationFn'
>;

// Upserts a microfrontend (add or edit) and invalidates the table
export function useUpsertMicrofrontend(versionId: string, options?: UseUpsertMicrofrontendOptions) {
  const queryClient = useQueryClient();
  return useMutation<CreateResponse<Microfrontend>, AxiosError, UpsertMicrofrontendVars>({
    ...options,
    mutationFn: upsertMicrofrontend,
    onSuccess: (result, ...args) => {
      queryClient.invalidateQueries({ queryKey: microfrontendsTableKey(versionId) });
      options?.onSuccess?.(result, ...args);
    },
  });
}
