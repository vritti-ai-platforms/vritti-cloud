import { type UseMutationOptions, useMutation, useQueryClient } from '@tanstack/react-query';
import type { CreateResponse } from '@vritti/quantum-ui/types/api-response';
import type { AxiosError } from 'axios';
import type { CreateTaxRegistrationData, TaxRegistration } from '@/schemas/cloud/org-structure';
import { createTaxRegistration } from '@/services/cloud/org-structure.service';
import { ORG_STRUCTURE_QUERY_KEY } from './useOrgStructure';

type CreateTaxRegistrationVars = { orgId: string; leId: string; data: CreateTaxRegistrationData };
type UseCreateTaxRegistrationOptions = Omit<
  UseMutationOptions<CreateResponse<TaxRegistration>, AxiosError, CreateTaxRegistrationVars>,
  'mutationFn'
>;

// Creates a tax registration and invalidates the org structure
export function useCreateTaxRegistration(options?: UseCreateTaxRegistrationOptions) {
  const queryClient = useQueryClient();
  return useMutation<CreateResponse<TaxRegistration>, AxiosError, CreateTaxRegistrationVars>({
    ...options,
    mutationFn: createTaxRegistration,
    onSuccess: (result, vars, ...args) => {
      queryClient.invalidateQueries({ queryKey: ORG_STRUCTURE_QUERY_KEY(vars.orgId) });
      options?.onSuccess?.(result, vars, ...args);
    },
  });
}
