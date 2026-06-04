import { type UseMutationOptions, useMutation, useQueryClient } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import { removePlanApp } from '../../../services/admin/plan-apps.service';
import { planAppsQueryKey } from './usePlanApps';
import { PLAN_APPS_TABLE_KEY } from './usePlanAppsTable';

type Vars = { planId: string; appId: string };
type UseRemovePlanAppOptions = Omit<UseMutationOptions<void, AxiosError, Vars>, 'mutationFn'>;

// Removes an app from a plan and invalidates the plan apps list and table
export function useRemovePlanApp(options?: UseRemovePlanAppOptions) {
  const queryClient = useQueryClient();
  return useMutation<void, AxiosError, Vars>({
    ...options,
    mutationFn: removePlanApp,
    onSuccess: (result, vars, ...args) => {
      queryClient.invalidateQueries({ queryKey: planAppsQueryKey(vars.planId) });
      queryClient.invalidateQueries({ queryKey: PLAN_APPS_TABLE_KEY(vars.planId) });
      options?.onSuccess?.(result, vars, ...args);
    },
  });
}
