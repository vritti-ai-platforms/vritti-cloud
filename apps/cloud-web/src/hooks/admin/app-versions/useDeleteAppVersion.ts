import { type UseMutationOptions, useMutation, useQueryClient } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import { deleteAppVersion } from '../../../services/admin/app-versions.service';
import { APP_VERSIONS_TABLE_KEY } from './useAppVersionsTable';

type UseDeleteAppVersionOptions = Omit<UseMutationOptions<void, AxiosError, string>, 'mutationFn'>;

// Deletes an app version and invalidates the versions list
export function useDeleteAppVersion(options?: UseDeleteAppVersionOptions) {
  const queryClient = useQueryClient();
  return useMutation<void, AxiosError, string>({
    ...options,
    mutationFn: deleteAppVersion,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: APP_VERSIONS_TABLE_KEY });
      options?.onSuccess?.(...args);
    },
  });
}
