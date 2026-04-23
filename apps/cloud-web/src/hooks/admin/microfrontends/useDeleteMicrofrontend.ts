import { type UseMutationOptions, useMutation, useQueryClient } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import { deleteMicrofrontend } from '../../../services/admin/microfrontends.service';
import { microfrontendsTableKey } from './useMicrofrontendsTable';

type DeleteMicrofrontendVars = { versionId: string; id: string };
type UseDeleteMicrofrontendOptions = Omit<
  UseMutationOptions<void, AxiosError, DeleteMicrofrontendVars>,
  'mutationFn'
>;

// Deletes a microfrontend and invalidates the table
export function useDeleteMicrofrontend(versionId: string, options?: UseDeleteMicrofrontendOptions) {
  const queryClient = useQueryClient();
  return useMutation<void, AxiosError, DeleteMicrofrontendVars>({
    ...options,
    mutationFn: deleteMicrofrontend,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: microfrontendsTableKey(versionId) });
      options?.onSuccess?.(...args);
    },
  });
}
