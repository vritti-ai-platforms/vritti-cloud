import { type UseMutationOptions, useMutation, useQueryClient } from '@tanstack/react-query';
import type { SuccessResponse } from '@vritti/quantum-ui/api-response';
import type { AxiosError } from 'axios';
import { finalizeAppVersion } from '../../../services/admin/app-versions.service';
import { APP_VERSIONS_TABLE_KEY } from './useAppVersionsTable';

type UseFinalizeAppVersionOptions = Omit<UseMutationOptions<SuccessResponse, AxiosError, string>, 'mutationFn'>;

// Finalizes an app version and invalidates the versions list
export function useFinalizeAppVersion(options?: UseFinalizeAppVersionOptions) {
  const queryClient = useQueryClient();
  return useMutation<SuccessResponse, AxiosError, string>({
    ...options,
    mutationFn: finalizeAppVersion,
    onSuccess: (result, ...args) => {
      queryClient.invalidateQueries({ queryKey: APP_VERSIONS_TABLE_KEY });
      options?.onSuccess?.(result, ...args);
    },
  });
}
