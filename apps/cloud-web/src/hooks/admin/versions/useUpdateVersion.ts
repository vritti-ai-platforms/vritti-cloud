import { type UseMutationOptions, useMutation, useQueryClient } from '@tanstack/react-query';
import type { SuccessResponse } from '@vritti/quantum-ui/api-response';
import type { AxiosError } from 'axios';
import type { UpdateVersionData } from '@/schemas/admin/versions';
import { updateVersion } from '../../../services/admin/versions.service';
import { versionQueryKey } from './useVersion';
import { VERSIONS_TABLE_KEY } from './useVersionsTable';

type Vars = { id: string; data: UpdateVersionData };
type UseUpdateVersionOptions = Omit<UseMutationOptions<SuccessResponse, AxiosError, Vars>, 'mutationFn'>;

// Updates a version and invalidates related queries
export function useUpdateVersion(options?: UseUpdateVersionOptions) {
  const queryClient = useQueryClient();
  return useMutation<SuccessResponse, AxiosError, Vars>({
    ...options,
    mutationFn: updateVersion,
    onSuccess: (result, vars, ...args) => {
      queryClient.invalidateQueries({ queryKey: versionQueryKey(vars.id) });
      queryClient.invalidateQueries({ queryKey: VERSIONS_TABLE_KEY });
      queryClient.invalidateQueries({ queryKey: ['select-resolve', 'select-api/versions'] });
      queryClient.invalidateQueries({ queryKey: ['select-search', 'select-api/versions'] });
      options?.onSuccess?.(result, vars, ...args);
    },
  });
}
