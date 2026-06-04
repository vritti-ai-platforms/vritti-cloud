import { type UseMutationOptions, useMutation, useQueryClient } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import { deleteApp } from '../../../services/admin/apps.service';
import { APPS_QUERY_KEY } from './useApps';

type UseDeleteAppOptions = Omit<UseMutationOptions<void, AxiosError, string>, 'mutationFn'>;

// Deletes an app and invalidates the apps list
export function useDeleteApp(versionId: string, options?: UseDeleteAppOptions) {
  const queryClient = useQueryClient();
  return useMutation<void, AxiosError, string>({
    ...options,
    mutationFn: (id) => deleteApp(versionId, id),
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: APPS_QUERY_KEY(versionId) });
      options?.onSuccess?.(...args);
    },
  });
}
