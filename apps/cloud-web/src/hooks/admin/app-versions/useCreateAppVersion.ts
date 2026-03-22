import { type UseMutationOptions, useMutation, useQueryClient } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import type { AppVersion, CreateAppVersionData } from '@/schemas/admin/app-versions';
import { createAppVersion } from '../../../services/admin/app-versions.service';
import { APP_VERSIONS_TABLE_KEY } from './useAppVersionsTable';

type UseCreateAppVersionOptions = Omit<UseMutationOptions<AppVersion, AxiosError, CreateAppVersionData>, 'mutationFn'>;

// Creates a new app version and invalidates the versions list
export function useCreateAppVersion(options?: UseCreateAppVersionOptions) {
  const queryClient = useQueryClient();
  return useMutation<AppVersion, AxiosError, CreateAppVersionData>({
    ...options,
    mutationFn: createAppVersion,
    onSuccess: (result, ...args) => {
      queryClient.invalidateQueries({ queryKey: APP_VERSIONS_TABLE_KEY });
      options?.onSuccess?.(result, ...args);
    },
  });
}
