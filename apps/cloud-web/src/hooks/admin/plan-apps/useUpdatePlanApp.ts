import { type UseMutationOptions, useMutation, useQueryClient } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import type { SuccessResponse } from '@vritti/quantum-ui/api-response';
import type { UpdatePlanAppData } from '@/schemas/admin/plan-apps';
import { updatePlanApp } from '../../../services/admin/plan-apps.service';
import { planAppsQueryKey } from './usePlanApps';
import { PLAN_APPS_TABLE_KEY } from './usePlanAppsTable';

type Vars = { planId: string; appId: string; data: UpdatePlanAppData };
type UseUpdatePlanAppOptions = Omit<UseMutationOptions<SuccessResponse, AxiosError, Vars>, 'mutationFn'>;

// Updates a plan-app assignment and invalidates caches
export function useUpdatePlanApp(options?: UseUpdatePlanAppOptions) {
  const queryClient = useQueryClient();
  return useMutation<SuccessResponse, AxiosError, Vars>({
    ...options,
    mutationFn: updatePlanApp,
    onSuccess: (result, vars, ...args) => {
      queryClient.invalidateQueries({ queryKey: planAppsQueryKey(vars.planId) });
      queryClient.invalidateQueries({ queryKey: PLAN_APPS_TABLE_KEY(vars.planId) });
      options?.onSuccess?.(result, vars, ...args);
    },
  });
}
