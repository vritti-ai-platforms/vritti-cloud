import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query';
import type { SuccessResponse } from '@vritti/quantum-ui/api-response';
import type { AxiosError } from 'axios';
import {
  getPlanMatrix,
  type PlanMatrixApp,
  type PlanUnlock,
  setPlanUnlocked,
} from '@/services/admin/versions/businesses/plans/permissions.service';

export type PlanUnlockPayload = { unlocks: PlanUnlock[] };

function matrixKey(planId: string) {
  return ['admin', 'plan-permissions', planId, 'matrix'] as const;
}

// Fetches the plan unlock matrix — apps (catalog) each with the plan's current unlocks nested. Suspense so the
// editor mounts with data already present (and can seed react-hook-form defaultValues directly).
export function usePlanUnlocks(versionId: string, businessId: string, planId: string) {
  return useSuspenseQuery<{ apps: PlanMatrixApp[] }, AxiosError>({
    queryKey: matrixKey(planId),
    queryFn: () => getPlanMatrix(versionId, businessId, planId),
  });
}

// Saves the plan's unlocks (each with its unlocked permissions)
export function useSetPlanUnlocked(versionId: string, businessId: string, planId: string) {
  const queryClient = useQueryClient();
  return useMutation<SuccessResponse, AxiosError, PlanUnlockPayload>({
    mutationFn: (payload) => setPlanUnlocked({ versionId, businessId, planId, ...payload }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: matrixKey(planId) }),
  });
}
