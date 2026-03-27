import { type UseMutationOptions, useMutation, useQueryClient } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import { deleteVersion } from '../../../services/admin/versions.service';
import { VERSIONS_TABLE_KEY } from './useVersionsTable';

type UseDeleteVersionOptions = Omit<UseMutationOptions<void, AxiosError, string>, 'mutationFn'>;

// Deletes a version and invalidates the versions list
export function useDeleteVersion(options?: UseDeleteVersionOptions) {
  const queryClient = useQueryClient();
  return useMutation<void, AxiosError, string>({
    ...options,
    mutationFn: deleteVersion,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: VERSIONS_TABLE_KEY });
      options?.onSuccess?.(...args);
    },
  });
}
