import { type UseMutationOptions, useMutation, useQueryClient } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import type { BusinessUnit, CreateBusinessUnitData } from '@/schemas/cloud/org-business-units';
import { createOrgBusinessUnit } from '../../../services/cloud/org-business-units.service';
import { ORG_BU_QUERY_KEY } from './useOrgBusinessUnits';

type CreateBuVars = { orgId: string; data: CreateBusinessUnitData };
type UseCreateBusinessUnitOptions = Omit<UseMutationOptions<BusinessUnit, AxiosError, CreateBuVars>, 'mutationFn'>;

// Creates a new business unit and invalidates the BU list
export function useCreateBusinessUnit(options?: UseCreateBusinessUnitOptions) {
  const queryClient = useQueryClient();
  return useMutation<BusinessUnit, AxiosError, CreateBuVars>({
    ...options,
    mutationFn: createOrgBusinessUnit,
    onSuccess: (result, vars, ...args) => {
      queryClient.invalidateQueries({ queryKey: ORG_BU_QUERY_KEY(vars.orgId) });
      options?.onSuccess?.(result, vars, ...args);
    },
  });
}
