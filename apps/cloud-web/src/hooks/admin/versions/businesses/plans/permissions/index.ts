import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { SuccessResponse } from '@vritti/quantum-ui/api-response';
import type { AxiosError } from 'axios';
import {
  type AvailablePlanApp,
  getPlanAvailableApps,
  getPlanUnlocked,
  type PlanUnlockGrant,
  setPlanUnlocked,
} from '@/services/admin/versions/businesses/plans/permissions.service';

function availableKey(planId: string) {
  return ['admin', 'plan-permissions', planId, 'apps'] as const;
}
function unlockedKey(planId: string) {
  return ['admin', 'plan-permissions', planId, 'unlocked'] as const;
}

// Fetches the unlock-matrix source for a plan (apps, each with its features)
export function usePlanAvailableApps(versionId: string, businessId: string, planId: string) {
  return useQuery<AvailablePlanApp[], AxiosError>({
    queryKey: availableKey(planId),
    queryFn: () => getPlanAvailableApps(versionId, businessId, planId),
    enabled: !!versionId && !!businessId && !!planId,
  });
}

// Fetches the plan's currently unlocked (feature-permission, platform) grants
export function usePlanUnlocked(versionId: string, businessId: string, planId: string) {
  return useQuery<{ grants: PlanUnlockGrant[] }, AxiosError>({
    queryKey: unlockedKey(planId),
    queryFn: () => getPlanUnlocked(versionId, businessId, planId),
    enabled: !!versionId && !!businessId && !!planId,
  });
}

// Saves the plan's unlocked grants
export function useSetPlanUnlocked(versionId: string, businessId: string, planId: string) {
  const queryClient = useQueryClient();
  return useMutation<SuccessResponse, AxiosError, PlanUnlockGrant[]>({
    mutationFn: (grants) => setPlanUnlocked({ versionId, businessId, planId, grants }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: unlockedKey(planId) }),
  });
}
