import { type UseMutationOptions, useMutation, useQueryClient } from '@tanstack/react-query';
import type { SuccessResponse } from '@vritti/quantum-ui/types/api-response';
import type { AxiosError } from 'axios';
import { deleteLegalEntity } from '@/services/cloud/org-structure.service';
import { ORG_STRUCTURE_QUERY_KEY } from './useOrgStructure';

type DeleteLegalEntityVars = { orgId: string; leId: string };
type UseDeleteLegalEntityOptions = Omit<
  UseMutationOptions<SuccessResponse, AxiosError, DeleteLegalEntityVars>,
  'mutationFn'
>;

// Deletes a legal entity and invalidates the org structure
export function useDeleteLegalEntity(options?: UseDeleteLegalEntityOptions) {
  const queryClient = useQueryClient();
  return useMutation<SuccessResponse, AxiosError, DeleteLegalEntityVars>({
    ...options,
    mutationFn: deleteLegalEntity,
    onSuccess: (result, vars, ...args) => {
      queryClient.invalidateQueries({ queryKey: ORG_STRUCTURE_QUERY_KEY(vars.orgId) });
      options?.onSuccess?.(result, vars, ...args);
    },
  });
}
