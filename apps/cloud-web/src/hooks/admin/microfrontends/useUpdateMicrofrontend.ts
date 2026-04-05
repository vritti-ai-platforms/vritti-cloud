import { type UseMutationOptions, useMutation, useQueryClient } from '@tanstack/react-query';
import type { SuccessResponse } from '@vritti/quantum-ui/api-response';
import type { AxiosError } from 'axios';
import type { UpdateMicrofrontendData } from '@/schemas/admin/microfrontends';
import { updateMicrofrontend } from '../../../services/admin/microfrontends.service';
import { microfrontendsTableKey } from './useMicrofrontendsTable';

type UpdateMicrofrontendVars = { versionId: string; id: string; data: UpdateMicrofrontendData };
type UseUpdateMicrofrontendOptions = Omit<
  UseMutationOptions<SuccessResponse, AxiosError, UpdateMicrofrontendVars>,
  'mutationFn'
>;

// Updates a microfrontend and invalidates the table
export function useUpdateMicrofrontend(versionId: string, options?: UseUpdateMicrofrontendOptions) {
  const queryClient = useQueryClient();
  return useMutation<SuccessResponse, AxiosError, UpdateMicrofrontendVars>({
    ...options,
    mutationFn: updateMicrofrontend,
    onSuccess: (result, ...args) => {
      queryClient.invalidateQueries({ queryKey: microfrontendsTableKey(versionId) });
      options?.onSuccess?.(result, ...args);
    },
  });
}
