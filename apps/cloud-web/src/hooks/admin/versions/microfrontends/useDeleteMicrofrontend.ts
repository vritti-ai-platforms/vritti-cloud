import { type UseMutationOptions, useMutation, useQueryClient } from '@tanstack/react-query';
import type { SuccessResponse } from '@vritti/quantum-ui/types/api-response';
import type { AxiosError } from 'axios';
import type { MicrofrontendPlatformParam } from '@/schemas/admin/microfrontends';
import { deleteMicrofrontend } from '@/services/admin/versions/microfrontends.service';
import { microfrontendsTableKey } from './useMicrofrontendsTable';

type DeleteMicrofrontendVars = { versionId: string; platform: MicrofrontendPlatformParam; id: string };
type UseDeleteMicrofrontendOptions = Omit<
  UseMutationOptions<SuccessResponse, AxiosError, DeleteMicrofrontendVars>,
  'mutationFn'
>;

// Deletes a microfrontend and invalidates the table
export function useDeleteMicrofrontend(versionId: string, options?: UseDeleteMicrofrontendOptions) {
  const queryClient = useQueryClient();
  return useMutation<SuccessResponse, AxiosError, DeleteMicrofrontendVars>({
    ...options,
    mutationFn: deleteMicrofrontend,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: microfrontendsTableKey(versionId) });
      options?.onSuccess?.(...args);
    },
  });
}
