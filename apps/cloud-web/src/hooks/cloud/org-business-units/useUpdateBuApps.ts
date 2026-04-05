import { type UseMutationOptions, useMutation, useQueryClient } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import type { SuccessResponse } from '@vritti/quantum-ui/api-response';
import { updateBuApps } from '../../../services/cloud/org-business-units.service';
import { ORG_BU_DETAIL_QUERY_KEY } from './useOrgBusinessUnit';
import { ORG_BU_QUERY_KEY } from './useOrgBusinessUnits';

type UpdateBuAppsVars = { orgId: string; buId: string; appCodes: string[] };
type UseUpdateBuAppsOptions = Omit<UseMutationOptions<SuccessResponse, AxiosError, UpdateBuAppsVars>, 'mutationFn'>;

// Updates the assigned apps for a business unit and invalidates BU queries
export function useUpdateBuApps(options?: UseUpdateBuAppsOptions) {
  const queryClient = useQueryClient();
  return useMutation<SuccessResponse, AxiosError, UpdateBuAppsVars>({
    ...options,
    mutationFn: updateBuApps,
    onSuccess: (result, vars, ...args) => {
      queryClient.invalidateQueries({ queryKey: ORG_BU_DETAIL_QUERY_KEY(vars.orgId, vars.buId) });
      queryClient.invalidateQueries({ queryKey: ORG_BU_QUERY_KEY(vars.orgId) });
      queryClient.invalidateQueries({ queryKey: BU_COMPATIBLE_ROLES_KEY(vars.orgId, vars.buId) });
      options?.onSuccess?.(result, vars, ...args);
    },
  });
}

export const BU_COMPATIBLE_ROLES_KEY = (orgId: string, buId: string) =>
  ['organizations', orgId, 'business-units', buId, 'compatible-roles'] as const;
