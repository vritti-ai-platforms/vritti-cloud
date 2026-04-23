import { type UseMutationOptions, useMutation, useQueryClient } from '@tanstack/react-query';
import type { SuccessResponse } from '@vritti/quantum-ui/api-response';
import type { AxiosError } from 'axios';
import { createSnapshot } from '../../../services/admin/versions.service';
import { VERSIONS_TABLE_KEY } from './useVersionsTable';
import { versionQueryKey } from './useVersion';

type UseCreateSnapshotOptions = Omit<UseMutationOptions<SuccessResponse, AxiosError, string>, 'mutationFn'>;

// Creates a snapshot for a version and invalidates caches
export function useCreateSnapshot(options?: UseCreateSnapshotOptions) {
  const queryClient = useQueryClient();
  return useMutation<SuccessResponse, AxiosError, string>({
    ...options,
    mutationFn: createSnapshot,
    onSuccess: (result, versionId, ...args) => {
      queryClient.invalidateQueries({ queryKey: VERSIONS_TABLE_KEY });
      queryClient.invalidateQueries({ queryKey: versionQueryKey(versionId) });
      options?.onSuccess?.(result, versionId, ...args);
    },
  });
}
