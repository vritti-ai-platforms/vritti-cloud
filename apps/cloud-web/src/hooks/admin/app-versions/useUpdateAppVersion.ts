import { type UseMutationOptions, useMutation, useQueryClient } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import type { SuccessResponse } from '@vritti/quantum-ui/api-response';
import type { UpdateAppVersionData } from '@/schemas/admin/app-versions';
import { updateAppVersion } from '../../../services/admin/app-versions.service';
import { appVersionQueryKey } from './useAppVersion';
import { APP_VERSIONS_TABLE_KEY } from './useAppVersionsTable';

type Vars = { id: string; data: UpdateAppVersionData };
type UseUpdateAppVersionOptions = Omit<UseMutationOptions<SuccessResponse, AxiosError, Vars>, 'mutationFn'>;

// Updates an app version and invalidates related queries
export function useUpdateAppVersion(options?: UseUpdateAppVersionOptions) {
  const queryClient = useQueryClient();
  return useMutation<SuccessResponse, AxiosError, Vars>({
    ...options,
    mutationFn: updateAppVersion,
    onSuccess: (result, vars, ...args) => {
      queryClient.invalidateQueries({ queryKey: appVersionQueryKey(vars.id) });
      queryClient.invalidateQueries({ queryKey: APP_VERSIONS_TABLE_KEY });
      options?.onSuccess?.(result, vars, ...args);
    },
  });
}
