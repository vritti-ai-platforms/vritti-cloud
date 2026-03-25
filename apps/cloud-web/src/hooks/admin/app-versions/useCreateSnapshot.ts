import { type UseMutationOptions, useMutation, useQueryClient } from '@tanstack/react-query';
import type { SuccessResponse } from '@vritti/quantum-ui/api-response';
import type { AxiosError } from 'axios';
import { createSnapshot } from '../../../services/admin/app-versions.service';
import { APP_VERSIONS_TABLE_KEY } from './useAppVersionsTable';
import { appVersionQueryKey } from './useAppVersion';

type UseCreateSnapshotOptions = Omit<UseMutationOptions<SuccessResponse, AxiosError, string>, 'mutationFn'>;

// Creates a snapshot for an app version and invalidates caches
export function useCreateSnapshot(options?: UseCreateSnapshotOptions) {
  const queryClient = useQueryClient();
  return useMutation<SuccessResponse, AxiosError, string>({
    ...options,
    mutationFn: createSnapshot,
    onSuccess: (result, versionId, ...args) => {
      queryClient.invalidateQueries({ queryKey: APP_VERSIONS_TABLE_KEY });
      queryClient.invalidateQueries({ queryKey: appVersionQueryKey(versionId) });
      options?.onSuccess?.(result, versionId, ...args);
    },
  });
}
