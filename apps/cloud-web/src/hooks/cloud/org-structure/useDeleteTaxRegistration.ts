import { type UseMutationOptions, useMutation, useQueryClient } from '@tanstack/react-query';
import type { SuccessResponse } from '@vritti/quantum-ui/types/api-response';
import type { AxiosError } from 'axios';
import { deleteTaxRegistration } from '@/services/cloud/org-structure.service';
import { ORG_STRUCTURE_QUERY_KEY } from './useOrgStructure';

type DeleteTaxRegistrationVars = { orgId: string; leId: string; regId: string };
type UseDeleteTaxRegistrationOptions = Omit<
  UseMutationOptions<SuccessResponse, AxiosError, DeleteTaxRegistrationVars>,
  'mutationFn'
>;

// Deletes a tax registration and invalidates the org structure
export function useDeleteTaxRegistration(options?: UseDeleteTaxRegistrationOptions) {
  const queryClient = useQueryClient();
  return useMutation<SuccessResponse, AxiosError, DeleteTaxRegistrationVars>({
    ...options,
    mutationFn: deleteTaxRegistration,
    onSuccess: (result, vars, ...args) => {
      queryClient.invalidateQueries({ queryKey: ORG_STRUCTURE_QUERY_KEY(vars.orgId) });
      options?.onSuccess?.(result, vars, ...args);
    },
  });
}
