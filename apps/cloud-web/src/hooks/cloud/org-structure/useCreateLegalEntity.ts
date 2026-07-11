import { type UseMutationOptions, useMutation, useQueryClient } from '@tanstack/react-query';
import type { CreateResponse } from '@vritti/quantum-ui/types/api-response';
import type { AxiosError } from 'axios';
import type { CreateLegalEntityData, LegalEntity } from '@/schemas/cloud/org-structure';
import { createLegalEntity } from '@/services/cloud/org-structure.service';
import { ORG_STRUCTURE_QUERY_KEY } from './useOrgStructure';

type CreateLegalEntityVars = { orgId: string; data: CreateLegalEntityData };
type UseCreateLegalEntityOptions = Omit<
  UseMutationOptions<CreateResponse<LegalEntity>, AxiosError, CreateLegalEntityVars>,
  'mutationFn'
>;

// Creates a legal entity and invalidates the org structure
export function useCreateLegalEntity(options?: UseCreateLegalEntityOptions) {
  const queryClient = useQueryClient();
  return useMutation<CreateResponse<LegalEntity>, AxiosError, CreateLegalEntityVars>({
    ...options,
    mutationFn: createLegalEntity,
    onSuccess: (result, vars, ...args) => {
      queryClient.invalidateQueries({ queryKey: ORG_STRUCTURE_QUERY_KEY(vars.orgId) });
      options?.onSuccess?.(result, vars, ...args);
    },
  });
}
