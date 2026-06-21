import { type UseMutationOptions, useMutation, useQueryClient } from '@tanstack/react-query';
import type { CreateResponse } from '@vritti/quantum-ui/api-response';
import type { AxiosError } from 'axios';
import type { App, CreateAppData } from '@/schemas/admin/apps';
import { createApp } from '@/services/admin/versions/businesses/apps.service';
import { APPS_QUERY_KEY } from './useApps';

type UseCreateAppOptions = Omit<UseMutationOptions<CreateResponse<App>, AxiosError, CreateAppData>, 'mutationFn'>;

// Creates a new app and invalidates the apps list for the business
export function useCreateApp(versionId: string, businessId: string, options?: UseCreateAppOptions) {
  const queryClient = useQueryClient();
  return useMutation<CreateResponse<App>, AxiosError, CreateAppData>({
    ...options,
    mutationFn: (data) => createApp(versionId, businessId, data),
    onSuccess: (result, ...args) => {
      queryClient.invalidateQueries({ queryKey: APPS_QUERY_KEY(versionId, businessId) });
      options?.onSuccess?.(result, ...args);
    },
  });
}
