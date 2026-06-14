import { type UseMutationOptions, useMutation } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import type { ValidateTaxIdResponse } from '@/schemas/cloud/organizations';
import { validateTaxId } from '@/services/cloud/organizations.service';

type Vars = { taxId: string; countryId?: string };
type UseValidateTaxIdOptions = Omit<UseMutationOptions<ValidateTaxIdResponse, AxiosError, Vars>, 'mutationFn'>;

// Mutation to validate a tax id and derive the matching country + market
export function useValidateTaxId(options?: UseValidateTaxIdOptions) {
  return useMutation<ValidateTaxIdResponse, AxiosError, Vars>({
    mutationFn: validateTaxId,
    ...options,
  });
}
