import { type UseMutationOptions, useMutation, useQueryClient } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import type { AssignPlanAppData, PlanApp } from '@/schemas/admin/plan-apps';
import { assignPlanApp } from '../../../services/admin/plan-apps.service';
import { planAppsQueryKey } from './usePlanApps';
import { PLAN_APPS_TABLE_KEY } from './usePlanAppsTable';

type Vars = { planId: string; data: AssignPlanAppData };
type UseAssignPlanAppOptions = Omit<UseMutationOptions<PlanApp, AxiosError, Vars>, 'mutationFn'>;

// Assigns an app to a plan and invalidates the plan apps list and table
export function useAssignPlanApp(options?: UseAssignPlanAppOptions) {
  const queryClient = useQueryClient();
  return useMutation<PlanApp, AxiosError, Vars>({
    ...options,
    mutationFn: assignPlanApp,
    onSuccess: (result, vars, ...args) => {
      queryClient.invalidateQueries({ queryKey: planAppsQueryKey(vars.planId) });
      queryClient.invalidateQueries({ queryKey: PLAN_APPS_TABLE_KEY(vars.planId) });
      options?.onSuccess?.(result, vars, ...args);
    },
  });
}
