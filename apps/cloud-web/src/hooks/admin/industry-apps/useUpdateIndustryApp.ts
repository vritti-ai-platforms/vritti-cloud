import { type UseMutationOptions, useMutation, useQueryClient } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import type { SuccessResponse } from '@vritti/quantum-ui/api-response';
import type { UpdateIndustryAppData } from '@/schemas/admin/industry-apps';
import { updateIndustryApp } from '../../../services/admin/industry-apps.service';
import { industryAppsQueryKey } from './useIndustryApps';

type Vars = { industryId: string; appId: string; data: UpdateIndustryAppData };
type UseUpdateIndustryAppOptions = Omit<UseMutationOptions<SuccessResponse, AxiosError, Vars>, 'mutationFn'>;

// Updates an app assignment on an industry and invalidates the industry apps list
export function useUpdateIndustryApp(options?: UseUpdateIndustryAppOptions) {
  const queryClient = useQueryClient();
  return useMutation<SuccessResponse, AxiosError, Vars>({
    ...options,
    mutationFn: updateIndustryApp,
    onSuccess: (result, vars, ...args) => {
      queryClient.invalidateQueries({ queryKey: industryAppsQueryKey(vars.industryId) });
      options?.onSuccess?.(result, vars, ...args);
    },
  });
}
