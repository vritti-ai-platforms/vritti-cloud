import { type UseMutationOptions, useMutation, useQueryClient } from '@tanstack/react-query';
import type { SuccessResponse } from '@vritti/quantum-ui/types/api-response';
import type { AxiosError } from 'axios';
import type { UpdateAppData } from '@/schemas/admin/apps';
import { updateApp } from '@/services/admin/versions/businesses/apps.service';
import { APPS_QUERY_KEY } from './useApps';

type UpdateAppVars = { id: string; data: UpdateAppData };
type UseUpdateAppOptions = Omit<UseMutationOptions<SuccessResponse, AxiosError, UpdateAppVars>, 'mutationFn'>;

// Updates an app and invalidates the apps list for the business
export function useUpdateApp(versionId: string, businessId: string, options?: UseUpdateAppOptions) {
  const queryClient = useQueryClient();
  return useMutation<SuccessResponse, AxiosError, UpdateAppVars>({
    ...options,
    mutationFn: (vars) => updateApp(versionId, businessId, vars),
    onSuccess: (result, ...args) => {
      queryClient.invalidateQueries({ queryKey: APPS_QUERY_KEY(versionId, businessId) });
      options?.onSuccess?.(result, ...args);
    },
  });
}
