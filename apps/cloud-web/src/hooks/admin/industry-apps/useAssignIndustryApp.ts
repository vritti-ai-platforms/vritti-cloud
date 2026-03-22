import { type UseMutationOptions, useMutation, useQueryClient } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import type { AssignIndustryAppData, IndustryApp } from '@/schemas/admin/industry-apps';
import { assignIndustryApp } from '../../../services/admin/industry-apps.service';
import { industryAppsQueryKey } from './useIndustryApps';

type Vars = { industryId: string; data: AssignIndustryAppData };
type UseAssignIndustryAppOptions = Omit<UseMutationOptions<IndustryApp, AxiosError, Vars>, 'mutationFn'>;

// Assigns an app to an industry and invalidates the industry apps list
export function useAssignIndustryApp(options?: UseAssignIndustryAppOptions) {
  const queryClient = useQueryClient();
  return useMutation<IndustryApp, AxiosError, Vars>({
    ...options,
    mutationFn: assignIndustryApp,
    onSuccess: (result, vars, ...args) => {
      queryClient.invalidateQueries({ queryKey: industryAppsQueryKey(vars.industryId) });
      options?.onSuccess?.(result, vars, ...args);
    },
  });
}
