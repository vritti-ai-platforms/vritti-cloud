import { type UseMutationOptions, useMutation, useQueryClient } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import type { App, CreateAppData } from '@/schemas/admin/apps';
import { createApp } from '../../../services/admin/apps.service';
import { APPS_QUERY_KEY } from './useApps';

type UseCreateAppOptions = Omit<UseMutationOptions<App, AxiosError, CreateAppData>, 'mutationFn'>;

// Creates a new app and invalidates the apps list
export function useCreateApp(versionId: string, options?: UseCreateAppOptions) {
  const queryClient = useQueryClient();
  return useMutation<App, AxiosError, CreateAppData>({
    ...options,
    mutationFn: (data) => createApp(versionId, data),
    onSuccess: (result, ...args) => {
      queryClient.invalidateQueries({ queryKey: APPS_QUERY_KEY(versionId) });
      options?.onSuccess?.(result, ...args);
    },
  });
}
