import { type UseMutationOptions, useMutation, useQueryClient } from '@tanstack/react-query';
import type { SuccessResponse } from '@vritti/quantum-ui/types/api-response';
import type { AxiosError } from 'axios';
import type { UpdateLegalEntityData } from '@/schemas/cloud/org-structure';
import { updateLegalEntity } from '@/services/cloud/org-structure.service';
import { ORG_STRUCTURE_QUERY_KEY } from './useOrgStructure';

type UpdateLegalEntityVars = { orgId: string; leId: string; data: UpdateLegalEntityData };
type UseUpdateLegalEntityOptions = Omit<
  UseMutationOptions<SuccessResponse, AxiosError, UpdateLegalEntityVars>,
  'mutationFn'
>;

// Updates a legal entity and invalidates the org structure
export function useUpdateLegalEntity(options?: UseUpdateLegalEntityOptions) {
  const queryClient = useQueryClient();
  return useMutation<SuccessResponse, AxiosError, UpdateLegalEntityVars>({
    ...options,
    mutationFn: updateLegalEntity,
    onSuccess: (result, vars, ...args) => {
      queryClient.invalidateQueries({ queryKey: ORG_STRUCTURE_QUERY_KEY(vars.orgId) });
      options?.onSuccess?.(result, vars, ...args);
    },
  });
}
