import { type UseMutationOptions, useMutation, useQueryClient } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import type { SuccessResponse } from '@vritti/quantum-ui/api-response';
import type { UpdateBusinessUnitData } from '@/schemas/cloud/org-business-units';
import { updateOrgBusinessUnit } from '../../../services/cloud/org-business-units.service';
import { ORG_BU_QUERY_KEY } from './useOrgBusinessUnits';

type UpdateBuVars = { orgId: string; buId: string; data: UpdateBusinessUnitData };
type UseUpdateBusinessUnitOptions = Omit<UseMutationOptions<SuccessResponse, AxiosError, UpdateBuVars>, 'mutationFn'>;

// Updates a business unit and invalidates the BU list
export function useUpdateBusinessUnit(options?: UseUpdateBusinessUnitOptions) {
  const queryClient = useQueryClient();
  return useMutation<SuccessResponse, AxiosError, UpdateBuVars>({
    ...options,
    mutationFn: updateOrgBusinessUnit,
    onSuccess: (result, vars, ...args) => {
      queryClient.invalidateQueries({ queryKey: ORG_BU_QUERY_KEY(vars.orgId) });
      options?.onSuccess?.(result, vars, ...args);
    },
  });
}
