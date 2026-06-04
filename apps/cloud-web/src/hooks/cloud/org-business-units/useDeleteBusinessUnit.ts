import { type UseMutationOptions, useMutation, useQueryClient } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import { deleteOrgBusinessUnit } from '../../../services/cloud/org-business-units.service';
import { ORG_BU_QUERY_KEY } from './useOrgBusinessUnits';

type DeleteBuVars = { orgId: string; buId: string };
type UseDeleteBusinessUnitOptions = Omit<UseMutationOptions<void, AxiosError, DeleteBuVars>, 'mutationFn'>;

// Deletes a business unit and invalidates the BU list
export function useDeleteBusinessUnit(options?: UseDeleteBusinessUnitOptions) {
  const queryClient = useQueryClient();
  return useMutation<void, AxiosError, DeleteBuVars>({
    ...options,
    mutationFn: deleteOrgBusinessUnit,
    onSuccess: (result, vars, ...args) => {
      queryClient.invalidateQueries({ queryKey: ORG_BU_QUERY_KEY(vars.orgId) });
      options?.onSuccess?.(result, vars, ...args);
    },
  });
}
