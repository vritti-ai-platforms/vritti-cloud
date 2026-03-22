import { type UseMutationOptions, useMutation, useQueryClient } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import { removeIndustryApp } from '../../../services/admin/industry-apps.service';
import { industryAppsQueryKey } from './useIndustryApps';

type Vars = { industryId: string; appId: string };
type UseRemoveIndustryAppOptions = Omit<UseMutationOptions<void, AxiosError, Vars>, 'mutationFn'>;

// Removes an app from an industry and invalidates the industry apps list
export function useRemoveIndustryApp(options?: UseRemoveIndustryAppOptions) {
  const queryClient = useQueryClient();
  return useMutation<void, AxiosError, Vars>({
    ...options,
    mutationFn: removeIndustryApp,
    onSuccess: (result, vars, ...args) => {
      queryClient.invalidateQueries({ queryKey: industryAppsQueryKey(vars.industryId) });
      options?.onSuccess?.(result, vars, ...args);
    },
  });
}
