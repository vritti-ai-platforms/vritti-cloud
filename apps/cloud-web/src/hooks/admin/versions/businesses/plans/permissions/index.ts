import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { SuccessResponse } from '@vritti/quantum-ui/api-response';
import type { AxiosError } from 'axios';
import {
  getPlanMatrix,
  type PlanMatrixApp,
  type PlanMembership,
  setPlanUnlocked,
} from '@/services/admin/versions/businesses/plans/permissions.service';

export type PlanUnlockPayload = { memberships: PlanMembership[] };

function matrixKey(planId: string) {
  return ['admin', 'plan-permissions', planId, 'matrix'] as const;
}

// Fetches the plan matrix — apps (catalog) each with the plan's current memberships nested under it
export function usePlanMatrix(versionId: string, businessId: string, planId: string) {
  return useQuery<{ apps: PlanMatrixApp[] }, AxiosError>({
    queryKey: matrixKey(planId),
    queryFn: () => getPlanMatrix(versionId, businessId, planId),
    enabled: !!versionId && !!businessId && !!planId,
  });
}

// Saves the plan's memberships (each with its unlocked permissions)
export function useSetPlanUnlocked(versionId: string, businessId: string, planId: string) {
  const queryClient = useQueryClient();
  return useMutation<SuccessResponse, AxiosError, PlanUnlockPayload>({
    mutationFn: (payload) => setPlanUnlocked({ versionId, businessId, planId, ...payload }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: matrixKey(planId) }),
  });
}
