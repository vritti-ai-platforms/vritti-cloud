import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { SuccessResponse } from '@vritti/quantum-ui/api-response';
import type { AxiosError } from 'axios';
import type { BuFeatureLocks, BuMatrix } from '@/schemas/cloud/bu-matrix';
import { getBuPermissionMatrix, setBuPermissions } from '@/services/cloud/org-business-units.service';
import { BU_COMPATIBLE_ROLES_KEY } from './useCompatibleRoles';
import { ORG_BU_DETAIL_QUERY_KEY } from './useOrgBusinessUnit';

export type BuLocksPayload = { locks: BuFeatureLocks };

export const BU_MATRIX_QUERY_KEY = (orgId: string, buId: string) =>
  ['organizations', orgId, 'business-units', buId, 'permissions', 'matrix'] as const;

// Fetches the BU matrix — snapshot-driven: all apps/features/permissions with per-platform inPlan/selected/availableIn
export function useBuPermissionMatrix(orgId: string, buId: string) {
  return useQuery<BuMatrix, AxiosError>({
    queryKey: BU_MATRIX_QUERY_KEY(orgId, buId),
    queryFn: () => getBuPermissionMatrix(orgId, buId),
    enabled: !!orgId && !!buId,
  });
}

// Saves the BU's lock deny-list (ceiling − selection) and refreshes the matrix
export function useSetBuPermissions(orgId: string, buId: string) {
  const queryClient = useQueryClient();
  return useMutation<SuccessResponse, AxiosError, BuLocksPayload>({
    mutationFn: (payload) => setBuPermissions({ orgId, buId, ...payload }),
    // Saving re-derives the BU's apps, so refresh the matrix, the BU detail (app count) and compatible roles
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BU_MATRIX_QUERY_KEY(orgId, buId) });
      queryClient.invalidateQueries({ queryKey: ORG_BU_DETAIL_QUERY_KEY(orgId, buId) });
      queryClient.invalidateQueries({ queryKey: BU_COMPATIBLE_ROLES_KEY(orgId, buId) });
    },
  });
}
